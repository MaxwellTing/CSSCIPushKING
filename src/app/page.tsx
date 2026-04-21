'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Settings, 
  RefreshCw, 
  Cloud, 
  CloudOff,
  Github
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import FluidBackground from '@/components/features/FluidBackground';
import ParticleFountain from '@/components/features/ParticleFountain';
import AcademicWidget from '@/components/features/AcademicWidget';
import VitalityWidget from '@/components/features/VitalityWidget';
import MindFlowWidget from '@/components/features/MindFlowWidget';
import PomodoroTimer from '@/components/features/PomodoroTimer';
import SettingsPanel from '@/components/features/SettingsPanel';

export default function Home() {
  const { 
    isDarkMode, 
    toggleDarkMode,
    githubToken,
    githubRepo,
    lastSyncTime,
    setLastSyncTime,
    getSyncData,
    loadFromData,
    waterGlasses,
    tasks
  } = useAppStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  
  // 检查是否触发粒子特效
  useEffect(() => {
    const allWaterDrunk = waterGlasses.every(g => g);
    const allTasksComplete = tasks.length > 0 && tasks.every(t => t.completed);
    
    if (allWaterDrunk || allTasksComplete) {
      setShowParticles(true);
    }
  }, [waterGlasses, tasks]);
  
  // 同步到 GitHub
  const handleSync = useCallback(async () => {
    if (!githubToken || !githubRepo) {
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          token: githubToken,
          repo: githubRepo,
          data: getSyncData()
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastSyncTime(Date.now());
        console.log('Sync successful:', result.commitSha);
      } else {
        console.error('Sync failed:', result.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [githubToken, githubRepo, getSyncData, setLastSyncTime]);
  
  // 从 GitHub 加载
  const handleLoad = useCallback(async () => {
    if (!githubToken || !githubRepo) {
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load',
          token: githubToken,
          repo: githubRepo
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        loadFromData(result.data);
        setLastSyncTime(Date.now());
        console.log('Load successful');
      } else {
        console.error('Load failed:', result.message);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [githubToken, githubRepo, loadFromData, setLastSyncTime]);
  
  // 初始化时尝试加载
  useEffect(() => {
    if (githubToken && githubRepo) {
      handleLoad();
    }
  }, []);
  
  // 自动同步（每5分钟）
  useEffect(() => {
    if (!githubToken || !githubRepo) return;
    
    const interval = setInterval(() => {
      handleSync();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [githubToken, githubRepo, handleSync]);
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* 动态流体背景 */}
      <FluidBackground isDark={isDarkMode} />
      
      {/* 粒子特效 */}
      <ParticleFountain 
        isActive={showParticles} 
        onComplete={() => setShowParticles(false)} 
      />
      
      {/* 主内容区 */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8">
        {/* 顶部导航栏 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white/90">Research & Life OS</h1>
              <p className="text-xs text-white/40">科研 · 生活 · 平衡</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 同步状态 */}
            {githubToken && githubRepo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </motion.button>
            )}
            
            {/* 主题切换 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            {/* 设置 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.header>
        
        {/* 主网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* 左侧：科研冲刺区 */}
          <div className="lg:col-span-2 space-y-6">
            <AcademicWidget />
            
            {/* 科研灵感区 */}
            <MindFlowWidget />
          </div>
          
          {/* 右侧：健康状态区 + 番茄钟 */}
          <div className="space-y-6">
            <VitalityWidget />
            <PomodoroTimer />
          </div>
        </div>
        
        {/* 底部状态栏 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4 text-xs text-white/40"
        >
          {githubToken && githubRepo ? (
            <>
              <Cloud className="w-3 h-3 text-green-400" />
              <span>已连接 GitHub</span>
              {lastSyncTime && (
                <span>· 上次同步: {new Date(lastSyncTime).toLocaleTimeString('zh-CN')}</span>
              )}
            </>
          ) : (
            <>
              <CloudOff className="w-3 h-3" />
              <span>离线模式 · 数据仅保存在本地</span>
            </>
          )}
        </motion.footer>
      </div>
      
      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />
    </div>
  );
}
