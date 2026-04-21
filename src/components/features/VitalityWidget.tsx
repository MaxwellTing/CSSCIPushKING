'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Dumbbell, Plus, Check, X } from 'lucide-react';
import { useAppStore, LIFE_TAGS } from '@/store/useAppStore';

interface FitnessRingProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
}

function FitnessRing({ progress, color, size = 80, strokeWidth = 8, label }: FitnessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* 进度圆环 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white/90">{Math.round(progress)}%</span>
      </div>
      <span className="text-xs text-white/50 mt-1">{label}</span>
    </div>
  );
}

interface WaterCupProps {
  filled: boolean;
  index: number;
  onClick: () => void;
  isMorning: boolean;
}

function WaterCup({ filled, index, onClick, isMorning }: WaterCupProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-10 h-14 rounded-b-lg rounded-t-sm transition-all duration-300 ${
        filled 
          ? 'bg-gradient-to-t from-cyan-400/80 to-blue-400/60 shadow-lg shadow-cyan-400/30' 
          : 'bg-white/10 border border-white/20'
      }`}
    >
      {/* 水波纹效果 */}
      {filled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-b-lg rounded-t-sm overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-cyan-400/50 to-transparent animate-pulse" />
        </motion.div>
      )}
      
      {/* 杯子把手 */}
      <div className={`absolute right-[-6px] top-2 w-2 h-6 rounded-r-full border-2 ${
        filled ? 'border-cyan-400/50' : 'border-white/20'
      }`} />
      
      {/* 序号 */}
      <span className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
        filled ? 'text-white' : 'text-white/30'
      }`}>
        {index + 1}
      </span>
    </motion.button>
  );
}

export default function VitalityWidget() {
  const { 
    waterGlasses, 
    toggleWaterGlass, 
    resetWaterGlasses,
    fitnessActivities,
    addFitnessActivity,
    toggleFitnessActivity
  } = useAppStore();
  
  const [showAddFitness, setShowAddFitness] = useState(false);
  const [newFitnessType, setNewFitnessType] = useState(LIFE_TAGS[0]);
  
  // 今日健身活动
  const todayActivities = fitnessActivities.filter(
    a => a.date === new Date().toISOString().split('T')[0]
  );
  
  // 健身完成进度
  const fitnessProgress = todayActivities.length > 0
    ? (todayActivities.filter(a => a.completed).length / todayActivities.length) * 100
    : 0;
  
  // 水杯完成进度
  const waterProgress = (waterGlasses.filter(Boolean).length / 8) * 100;
  
  // 上午/下午分组
  const morningGlasses = waterGlasses.slice(0, 4);
  const afternoonGlasses = waterGlasses.slice(4, 8);
  
  // 检查是否完成所有水杯
  const allWaterComplete = waterGlasses.every(Boolean);
  
  const handleAddFitness = () => {
    addFitnessActivity({
      type: newFitnessType,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddFitness(false);
  };
  
  return (
    <div className="space-y-4">
      {/* 八杯水追踪 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white/90">八杯水追踪</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">
              {waterGlasses.filter(Boolean).length}/8 杯
            </span>
            <button
              onClick={resetWaterGlasses}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${waterProgress}%` }}
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
          />
        </div>
        
        {/* 上午水杯 */}
        <div className="mb-4">
          <div className="text-xs text-white/40 mb-2 flex items-center gap-2">
            <span>🌅 上午 (建议 4 杯)</span>
            <span className="text-cyan-400/60">
              {morningGlasses.filter(Boolean).length}/4
            </span>
          </div>
          <div className="flex justify-center gap-3">
            {morningGlasses.map((filled, index) => (
              <WaterCup
                key={index}
                filled={filled}
                index={index}
                onClick={() => toggleWaterGlass(index)}
                isMorning={true}
              />
            ))}
          </div>
        </div>
        
        {/* 下午水杯 */}
        <div>
          <div className="text-xs text-white/40 mb-2 flex items-center gap-2">
            <span>🌆 下午 (建议 4 杯)</span>
            <span className="text-cyan-400/60">
              {afternoonGlasses.filter(Boolean).length}/4
            </span>
          </div>
          <div className="flex justify-center gap-3">
            {afternoonGlasses.map((filled, index) => (
              <WaterCup
                key={index + 4}
                filled={filled}
                index={index + 4}
                onClick={() => toggleWaterGlass(index + 4)}
                isMorning={false}
              />
            ))}
          </div>
        </div>
        
        {/* 完成提示 */}
        <AnimatePresence>
          {allWaterComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-400/20 to-blue-400/20 border border-cyan-400/30 text-center"
            >
              <span className="text-cyan-400 font-medium">🎉 今日补水目标达成！</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* 健身打卡 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white/90">健身打卡</h3>
          </div>
          <button
            onClick={() => setShowAddFitness(true)}
            className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-400/20 text-orange-400 hover:bg-orange-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Apple Watch 风格圆环 */}
        <div className="flex justify-center gap-6 mb-6">
          <FitnessRing
            progress={fitnessProgress}
            color="#FF6B35"
            label="运动"
          />
          <FitnessRing
            progress={todayActivities.filter(a => a.completed && a.type.includes('有氧')).length > 0 ? 100 : 0}
            color="#4ECDC4"
            label="有氧"
          />
          <FitnessRing
            progress={todayActivities.filter(a => a.completed && a.type.includes('力量')).length > 0 ? 100 : 0}
            color="#FF4081"
            label="力量"
          />
        </div>
        
        {/* 今日活动列表 */}
        <div className="space-y-2">
          <AnimatePresence>
            {todayActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => toggleFitnessActivity(activity.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  activity.completed
                    ? 'bg-orange-500/10 border border-orange-400/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  activity.completed
                    ? 'border-orange-400 bg-orange-400'
                    : 'border-white/30'
                }`}>
                  {activity.completed && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className={`flex-1 ${
                  activity.completed ? 'text-white/50 line-through' : 'text-white/80'
                }`}>
                  {activity.type}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todayActivities.length === 0 && (
            <div className="text-center py-6 text-white/30">
              点击 + 添加今日运动计划
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 添加健身活动弹窗 */}
      <AnimatePresence>
        {showAddFitness && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddFitness(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white/10 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white/90">添加运动</h3>
                <button
                  onClick={() => setShowAddFitness(false)}
                  className="text-white/50 hover:text-white/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {LIFE_TAGS.filter(t => t !== '#补水').map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNewFitnessType(tag)}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      newFitnessType === tag
                        ? 'bg-orange-500/20 border border-orange-400/40 text-orange-400'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleAddFitness}
                className="w-full py-3 rounded-xl bg-orange-500/80 text-white font-medium hover:bg-orange-500 transition-colors"
              >
                添加
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
