'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Github, Cloud, CloudOff, Check, ExternalLink, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

export default function SettingsPanel({ 
  isOpen, 
  onClose, 
  onSync, 
  isSyncing,
  lastSyncTime 
}: SettingsPanelProps) {
  const { 
    githubToken, 
    githubRepo, 
    setGithubConfig,
    isDarkMode,
    toggleDarkMode
  } = useAppStore();
  
  const [tokenInput, setTokenInput] = useState(githubToken);
  const [repoInput, setRepoInput] = useState(githubRepo);
  const [showToken, setShowToken] = useState(false);
  
  const handleSave = () => {
    setGithubConfig(tokenInput, repoInput);
    onClose();
  };
  
  const formatLastSync = (time: number | null) => {
    if (!time) return '从未同步';
    const date = new Date(time);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md rounded-2xl bg-white/10 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-white/70" />
                <h3 className="text-lg font-semibold text-white/90">设置</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 主题切换 */}
            <div className="mb-6">
              <label className="text-sm text-white/60 mb-2 block">主题模式</label>
              <div className="flex gap-2">
                <button
                  onClick={() => !isDarkMode || toggleDarkMode()}
                  className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                    !isDarkMode
                      ? 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
                      : 'bg-white/5 border border-white/10 text-white/60'
                  }`}
                >
                  ☀️ 浅色
                </button>
                <button
                  onClick={() => isDarkMode || toggleDarkMode()}
                  className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                    isDarkMode
                      ? 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-400'
                      : 'bg-white/5 border border-white/10 text-white/60'
                  }`}
                >
                  🌙 深色
                </button>
              </div>
            </div>
            
            {/* GitHub 配置 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Github className="w-4 h-4 text-white/60" />
                <label className="text-sm text-white/60">GitHub 同步配置</label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Personal Access Token</label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 pr-16"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/60"
                    >
                      {showToken ? '隐藏' : '显示'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-white/40 mb-1 block">仓库地址 (owner/repo)</label>
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    placeholder="username/my-repo"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400/70 hover:text-blue-400 mt-2"
              >
                创建 Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            {/* 同步状态 */}
            <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {githubToken && githubRepo ? (
                    <Cloud className="w-4 h-4 text-green-400" />
                  ) : (
                    <CloudOff className="w-4 h-4 text-white/40" />
                  )}
                  <span className="text-sm text-white/60">
                    {githubToken && githubRepo ? '已配置' : '未配置'}
                  </span>
                </div>
                <span className="text-xs text-white/40">
                  上次同步: {formatLastSync(lastSyncTime)}
                </span>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!tokenInput || !repoInput}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存配置
              </button>
            </div>
            
            {/* 手动同步按钮 */}
            {githubToken && githubRepo && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="w-full mt-3 py-2 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                {isSyncing ? '同步中...' : '立即同步到 GitHub'}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
