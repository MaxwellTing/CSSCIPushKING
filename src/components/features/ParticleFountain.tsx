'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleFountainProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function ParticleFountain({ isActive, onComplete }: ParticleFountainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);
  
  const colors = [
    '#FFD700', // 金色
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#45B7D1', // 蓝色
    '#96CEB4', // 绿色
    '#FFEAA7', // 黄色
    '#DDA0DD', // 紫色
    '#98D8C8', // 薄荷绿
  ];
  
  const createParticle = useCallback((x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    
    return {
      id: particleIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5 - Math.random() * 5,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 60 + Math.random() * 60,
    };
  }, []);
  
  useEffect(() => {
    if (!isActive) {
      particlesRef.current = [];
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 初始爆发
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(createParticle(centerX, centerY));
    }
    
    let frameCount = 0;
    const maxFrames = 180; // 3秒
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life++;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.15; // 重力
        particle.vx *= 0.99; // 空气阻力
        
        const alpha = 1 - (particle.life / particle.maxLife);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // 添加发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        
        return particle.life < particle.maxLife;
      });
      
      // 持续喷射
      if (frameCount < 60 && frameCount % 3 === 0) {
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push(createParticle(
            centerX + (Math.random() - 0.5) * 100,
            centerY + 50
          ));
        }
      }
      
      frameCount++;
      
      if (frameCount < maxFrames || particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, createParticle, onComplete]);
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
