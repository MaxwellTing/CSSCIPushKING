'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Bell, Coffee, StretchVertical } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const { 
    pomodoroTime, 
    setPomodoroTime, 
    pomodoroRunning, 
    setPomodoroRunning,
    pomodoroTarget,
    setPomodoroTarget
  } = useAppStore();
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'water' | 'stretch'>('water');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // 更新回调引用
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 计算进度
  const progress = pomodoroTarget > 0 ? ((pomodoroTarget * 60 - pomodoroTime) / (pomodoroTarget * 60)) * 100 : 0;
  
  // 播放提示音
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.5);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.5);
      };
      
      playTone(800, 0);
      playTone(800, 0.6);
      playTone(1000, 1.2);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);
  
  // 处理计时器完成
  const handleTimerComplete = useCallback(() => {
    setPomodoroRunning(false);
    playNotificationSound();
    setNotificationType(Math.random() > 0.5 ? 'water' : 'stretch');
    setShowNotification(true);
    onCompleteRef.current?.();
  }, [setPomodoroRunning, playNotificationSound]);
  
  // 计时器逻辑
  useEffect(() => {
    if (pomodoroRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(pomodoroTime - 1);
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoroRunning, pomodoroTime, setPomodoroTime]);
  
  // 检查计时器是否完成 - 使用 setTimeout 避免在 effect 中直接调用 setState
  useEffect(() => {
    if (pomodoroTime === 0 && pomodoroRunning) {
      const timeoutId = setTimeout(() => {
        handleTimerComplete();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [pomodoroTime, pomodoroRunning, handleTimerComplete]);
  
  // 开始/暂停
  const toggleTimer = () => {
    if (!pomodoroRunning && pomodoroTime === 0) {
      setPomodoroTime(pomodoroTarget * 60);
    }
    setPomodoroRunning(!pomodoroRunning);
  };
  
  // 重置
  const resetTimer = () => {
    setPomodoroRunning(false);
    setPomodoroTime(pomodoroTarget * 60);
  };
  
  // 设置目标时间
  const setTarget = (minutes: number) => {
    setPomodoroTarget(minutes);
    setPomodoroTime(minutes * 60);
    setPomodoroRunning(false);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-white/90">番茄钟</h3>
          </div>
          <span className="text-xs text-white/40">
            每 {pomodoroTarget} 分钟提醒
          </span>
        </div>
        
        {/* 圆形计时器 */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          {/* 背景圆环 */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/10"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FF8E53" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* 时间显示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white/90 font-mono">
              {formatTime(pomodoroTime)}
            </span>
            <span className="text-xs text-white/40 mt-1">
              {pomodoroRunning ? '专注中...' : '准备开始'}
            </span>
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-full transition-all ${
              pomodoroRunning
                ? 'bg-rose-500/20 border border-rose-400/30 text-rose-400'
                : 'bg-gradient-to-r from-rose-500/80 to-orange-500/80 text-white shadow-lg shadow-rose-500/20'
            }`}
          >
            {pomodoroRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
        </div>
        
        {/* 时间预设 */}
        <div className="flex justify-center gap-2">
          {[25, 45, 60].map((minutes) => (
            <button
              key={minutes}
              onClick={() => setTarget(minutes)}
              disabled={pomodoroRunning}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                pomodoroTarget === minutes
                  ? 'bg-rose-500/20 border border-rose-400/30 text-rose-400'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              } ${pomodoroRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {minutes}分钟
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* 提醒弹窗 */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowNotification(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/20 p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  notificationType === 'water' 
                    ? 'bg-cyan-500/20' 
                    : 'bg-green-500/20'
                }`}
              >
                {notificationType === 'water' ? (
                  <Coffee className="w-10 h-10 text-cyan-400" />
                ) : (
                  <StretchVertical className="w-10 h-10 text-green-400" />
                )}
              </motion.div>
              
              <h3 className="text-xl font-bold text-white/90 mb-2">
                {notificationType === 'water' ? '该喝水啦！' : '站起来活动一下！'}
              </h3>
              
              <p className="text-white/60 mb-6">
                {notificationType === 'water'
                  ? '你已经专注了 45 分钟，喝杯水补充水分吧 💧'
                  : '久坐伤身，站起来拉伸一下身体吧 🧘'}
              </p>
              
              <button
                onClick={() => {
                  setShowNotification(false);
                  setPomodoroTime(pomodoroTarget * 60);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500/80 to-orange-500/80 text-white font-medium hover:from-rose-500 hover:to-orange-500 transition-all"
              >
                开始新一轮
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
