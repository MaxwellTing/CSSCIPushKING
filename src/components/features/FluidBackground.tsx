'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface FluidBackgroundProps {
  isDark: boolean;
}

interface BlobData {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
}

// 创建blob数据
function createBlob(width: number, height: number): BlobData {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 100 + Math.random() * 200,
    angle: Math.random() * Math.PI * 2,
    speed: 0.2 + Math.random() * 0.3,
    wobble: Math.random() * 50,
    wobbleSpeed: 0.01 + Math.random() * 0.02,
  };
}

// 更新blob位置
function updateBlob(blob: BlobData, width: number, height: number): void {
  blob.angle += blob.speed * 0.01;
  blob.wobble += blob.wobbleSpeed;
  
  blob.x += Math.cos(blob.angle) * blob.speed;
  blob.y += Math.sin(blob.angle) * blob.speed;
  
  // 边界处理
  if (blob.x < -blob.radius) blob.x = width + blob.radius;
  if (blob.x > width + blob.radius) blob.x = -blob.radius;
  if (blob.y < -blob.radius) blob.y = height + blob.radius;
  if (blob.y > height + blob.radius) blob.y = -blob.radius;
}

// 绘制blob
function drawBlob(
  ctx: CanvasRenderingContext2D,
  blob: BlobData,
  time: number,
  progress: number,
  isDark: boolean
): void {
  const wobbleX = Math.sin(time * 0.001 + blob.wobble) * 30;
  const wobbleY = Math.cos(time * 0.001 + blob.wobble) * 30;
  
  // 根据进度计算颜色
  const hue = 200 + progress * 40;
  const saturation = 60 + progress * 20;
  const lightness = isDark ? (15 + progress * 25) : (30 + progress * 30);
  
  const gradient = ctx.createRadialGradient(
    blob.x + wobbleX, blob.y + wobbleY, 0,
    blob.x + wobbleX, blob.y + wobbleY, blob.radius
  );
  
  const alpha1 = 0.3 + progress * 0.2;
  const alpha2 = 0.1;
  
  gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha1})`);
  gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha2})`);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(blob.x + wobbleX, blob.y + wobbleY, blob.radius, 0, Math.PI * 2);
  ctx.fill();
}

export default function FluidBackground({ isDark }: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tasks = useAppStore((state) => state.tasks);
  
  // 计算任务完成进度
  const progress = tasks.length > 0 
    ? tasks.filter(t => t.completed).length / tasks.length 
    : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // 创建多个blob
    const blobs: BlobData[] = [];
    for (let i = 0; i < 5; i++) {
      blobs.push(createBlob(canvas.width, canvas.height));
    }
    
    const animate = () => {
      time++;
      
      // 清除画布
      ctx.fillStyle = isDark ? '#0a0a0f' : '#f0f4f8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制blobs
      blobs.forEach(blob => {
        updateBlob(blob, canvas.width, canvas.height);
        drawBlob(ctx, blob, time, progress, isDark);
      });
      
      // 添加噪点效果
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isDark, progress]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        background: isDark ? '#0a0a0f' : '#f0f4f8',
        transition: 'background 0.5s ease'
      }}
    />
  );
}
