'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  PenLine, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Calendar,
  FileText,
  Timer
} from 'lucide-react';
import { useAppStore, ACADEMIC_TAGS, AcademicTask } from '@/store/useAppStore';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function AcademicWidget() {
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask,
    studySessions,
    addStudySession,
    literatureRecords,
    addLiteratureRecord,
    wordCount,
    setWordCount,
    countdownDate,
    countdownLabel,
    setCountdownDate
  } = useAppStore();
  
  const [newTask, setNewTask] = useState('');
  const [selectedTag, setSelectedTag] = useState(ACADEMIC_TAGS[0]);
  const [showLiteratureForm, setShowLiteratureForm] = useState(false);
  const [literatureForm, setLiteratureForm] = useState({
    title: '',
    author: '',
    pages: 0,
    notes: ''
  });
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCountdownSetup, setShowCountdownSetup] = useState(false);
  const [newCountdownDate, setNewCountdownDate] = useState('');
  const [newCountdownLabel, setNewCountdownLabel] = useState('');
  
  // 今日任务
  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt).toDateString();
    return taskDate === new Date().toDateString();
  });
  
  // 任务完成进度
  const taskProgress = todayTasks.length > 0 
    ? (todayTasks.filter(t => t.completed).length / todayTasks.length) * 100 
    : 0;
  
  // 倒计时计算
  useEffect(() => {
    if (!countdownDate) return;
    
    const updateCountdown = () => {
      const target = new Date(countdownDate).getTime();
      const now = Date.now();
      const diff = target - now;
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [countdownDate]);
  
  // 今日学习时段统计
  const todaySessions = studySessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
  const morningTime = todaySessions.filter(s => s.period === 'morning').reduce((acc, s) => acc + s.duration, 0);
  const afternoonTime = todaySessions.filter(s => s.period === 'afternoon').reduce((acc, s) => acc + s.duration, 0);
  const eveningTime = todaySessions.filter(s => s.period === 'evening').reduce((acc, s) => acc + s.duration, 0);
  
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTask({ title: newTask, completed: false, tag: selectedTag });
    setNewTask('');
  };
  
  const handleAddLiterature = () => {
    if (!literatureForm.title.trim()) return;
    addLiteratureRecord({
      ...literatureForm,
      date: new Date().toISOString().split('T')[0]
    });
    setLiteratureForm({ title: '', author: '', pages: 0, notes: '' });
    setShowLiteratureForm(false);
  };
  
  const getCurrentPeriod = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };
  
  const handleAddStudySession = (duration: number) => {
    addStudySession({
      period: getCurrentPeriod(),
      duration,
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  return (
    <div className="space-y-4">
      {/* 倒计时卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white/90">{countdownLabel || '目标倒计时'}</h3>
          </div>
          <button
            onClick={() => setShowCountdownSetup(true)}
            className="text-white/50 hover:text-white/80 transition-colors"
          >
            <PenLine className="w-4 h-4" />
          </button>
        </div>
        
        {countdownDate ? (
          <div className="flex justify-center gap-4">
            {[
              { value: countdown.days, label: '天' },
              { value: countdown.hours, label: '时' },
              { value: countdown.minutes, label: '分' },
              { value: countdown.seconds, label: '秒' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-400">{item.value}</span>
                </div>
                <span className="text-xs text-white/50 mt-1">{item.label}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowCountdownSetup(true)}
            className="w-full py-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 transition-all"
          >
            设置目标日期
          </button>
        )}
        
        {/* 倒计时设置弹窗 */}
        <AnimatePresence>
          {showCountdownSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 w-full max-w-xs space-y-4">
                <input
                  type="date"
                  value={newCountdownDate}
                  onChange={(e) => setNewCountdownDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
                <input
                  type="text"
                  placeholder="目标名称（如：博士毕业）"
                  value={newCountdownLabel}
                  onChange={(e) => setNewCountdownLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCountdownSetup(false)}
                    className="flex-1 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (newCountdownDate) {
                        setCountdownDate(newCountdownDate, newCountdownLabel || '目标');
                        setShowCountdownSetup(false);
                      }
                    }}
                    className="flex-1 py-2 rounded-lg bg-amber-500/80 text-white hover:bg-amber-500 transition-colors"
                  >
                    确认
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* 今日任务卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">今日学术任务</h3>
          </div>
          <span className="text-sm text-white/50">
            {todayTasks.filter(t => t.completed).length}/{todayTasks.length} 完成
          </span>
        </div>
        
        {/* 进度条 */}
        <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${taskProgress}%` }}
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
          />
        </div>
        
        {/* 添加任务 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="添加新任务..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 focus:outline-none"
          >
            {ACADEMIC_TAGS.map(tag => (
              <option key={tag} value={tag} className="bg-gray-800">{tag}</option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* 任务列表 */}
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                  task.completed 
                    ? 'bg-green-500/10 border border-green-400/20' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'border-green-400 bg-green-400' 
                    : 'border-white/30'
                }`}>
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 ${task.completed ? 'text-white/50 line-through' : 'text-white/80'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-white/40">{task.tag}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {todayTasks.length === 0 && (
            <div className="text-center py-8 text-white/30">
              暂无任务，开始添加吧！
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 学习时间记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white/90">学习时间记录</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { period: 'morning', label: '上午', time: morningTime, color: 'from-orange-400 to-amber-400' },
            { period: 'afternoon', label: '下午', time: afternoonTime, color: 'from-blue-400 to-cyan-400' },
            { period: 'evening', label: '晚间', time: eveningTime, color: 'from-purple-400 to-pink-400' },
          ].map((item) => (
            <div
              key={item.period}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-xs text-white/50 mb-1">{item.label}</div>
              <div className={`text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                {item.time}
              </div>
              <div className="text-xs text-white/30">分钟</div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((duration) => (
            <button
              key={duration}
              onClick={() => handleAddStudySession(duration)}
              className="flex-1 py-2 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors"
            >
              +{duration}分钟
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* 字数计数器 & 文献阅读 */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-medium text-white/70">字数计数器</h4>
          </div>
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
            className="w-full text-3xl font-bold text-center bg-transparent text-white/90 focus:outline-none"
            placeholder="0"
          />
          <div className="text-xs text-center text-white/30 mt-1">字</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-medium text-white/70">文献阅读</h4>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {literatureRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </div>
            <div className="text-xs text-white/30">今日阅读</div>
          </div>
          <button
            onClick={() => setShowLiteratureForm(true)}
            className="w-full mt-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors"
          >
            + 添加记录
          </button>
        </motion.div>
      </div>
      
      {/* 文献记录弹窗 */}
      <AnimatePresence>
        {showLiteratureForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLiteratureForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white/10 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white/90 mb-4">添加文献阅读记录</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="文献标题"
                  value={literatureForm.title}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />
                <input
                  type="text"
                  placeholder="作者"
                  value={literatureForm.author}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />
                <input
                  type="number"
                  placeholder="阅读页数"
                  value={literatureForm.pages || ''}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, pages: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />
                <textarea
                  placeholder="笔记..."
                  value={literatureForm.notes}
                  onChange={(e) => setLiteratureForm({ ...literatureForm, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 min-h-[80px] resize-none"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowLiteratureForm(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddLiterature}
                  className="flex-1 py-2 rounded-xl bg-cyan-500/80 text-white hover:bg-cyan-500 transition-colors"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
