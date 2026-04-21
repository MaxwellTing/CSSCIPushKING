'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Plus, X, Trash2, Clock } from 'lucide-react';
import { useAppStore, ACADEMIC_TAGS } from '@/store/useAppStore';

export default function MindFlowWidget() {
  const { inspirationNotes, addInspirationNote, deleteInspirationNote } = useAppStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedTag, setSelectedTag] = useState(ACADEMIC_TAGS[0]);
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addInspirationNote({ content: newNote, tag: selectedTag });
    setNewNote('');
    setIsExpanded(false);
  };
  
  // 最近5条灵感
  const recentNotes = [...inspirationNotes]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white/90">科研灵感</h3>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* 灵感列表 */}
      <div className="space-y-3">
        <AnimatePresence>
          {recentNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">
                  {note.tag}
                </span>
                <p className="text-sm text-white/80 flex-1 leading-relaxed">
                  {note.content}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(note.createdAt)}
                </span>
                <button
                  onClick={() => deleteInspirationNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {recentNotes.length === 0 && (
          <div className="text-center py-8 text-white/30">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">记录你的学术闪念...</p>
          </div>
        )}
      </div>
      
      {/* 添加灵感弹窗 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-white/15 to-white/5 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">记录灵感</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="写下你的学术闪念或对文献的感悟..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 min-h-[120px] resize-none mb-4"
                autoFocus
              />
              
              <div className="flex flex-wrap gap-2 mb-4">
                {ACADEMIC_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      selectedTag === tag
                        ? 'bg-yellow-500/20 border border-yellow-400/40 text-yellow-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white font-medium hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存灵感
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
