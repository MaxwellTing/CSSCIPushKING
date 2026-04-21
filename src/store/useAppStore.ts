import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 类型定义
export interface AcademicTask {
  id: string;
  title: string;
  completed: boolean;
  tag: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  duration: number; // 分钟
  date: string;
}

export interface LiteratureRecord {
  id: string;
  title: string;
  author: string;
  pages: number;
  notes: string;
  date: string;
}

export interface InspirationNote {
  id: string;
  content: string;
  tag: string;
  createdAt: number;
}

export interface FitnessActivity {
  id: string;
  type: string;
  completed: boolean;
  date: string;
}

export interface AppState {
  // 科研相关
  tasks: AcademicTask[];
  studySessions: StudySession[];
  literatureRecords: LiteratureRecord[];
  wordCount: number;
  countdownDate: string;
  countdownLabel: string;
  
  // 健康相关
  waterGlasses: boolean[];
  fitnessActivities: FitnessActivity[];
  
  // 灵感记录
  inspirationNotes: InspirationNote[];
  
  // 番茄钟
  pomodoroTime: number;
  pomodoroRunning: boolean;
  pomodoroTarget: number;
  
  // 设置
  githubToken: string;
  githubRepo: string;
  lastSyncTime: number | null;
  isDarkMode: boolean;
  
  // Actions
  addTask: (task: Omit<AcademicTask, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  
  addLiteratureRecord: (record: Omit<LiteratureRecord, 'id'>) => void;
  
  setWordCount: (count: number) => void;
  setCountdownDate: (date: string, label: string) => void;
  
  toggleWaterGlass: (index: number) => void;
  resetWaterGlasses: () => void;
  
  addFitnessActivity: (activity: Omit<FitnessActivity, 'id'>) => void;
  toggleFitnessActivity: (id: string) => void;
  
  addInspirationNote: (note: Omit<InspirationNote, 'id' | 'createdAt'>) => void;
  deleteInspirationNote: (id: string) => void;
  
  setPomodoroTime: (time: number) => void;
  setPomodoroRunning: (running: boolean) => void;
  setPomodoroTarget: (target: number) => void;
  
  setGithubConfig: (token: string, repo: string) => void;
  setLastSyncTime: (time: number) => void;
  toggleDarkMode: () => void;
  
  // 批量更新（用于同步）
  loadFromData: (data: Partial<AppState>) => void;
  getSyncData: () => Partial<AppState>;
  
  // 重置今日数据
  resetDailyData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const getTodayString = () => new Date().toISOString().split('T')[0];

// 预设标签
export const ACADEMIC_TAGS = [
  '#文献阅读',
  '#田野调查', 
  '#论文撰写',
  '#导师会议'
];

export const LIFE_TAGS = [
  '#力量训练',
  '#有氧',
  '#羽毛球',
  '#补水',
  '#冥想'
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      tasks: [],
      studySessions: [],
      literatureRecords: [],
      wordCount: 0,
      countdownDate: '',
      countdownLabel: '博士毕业',
      
      waterGlasses: [false, false, false, false, false, false, false, false],
      fitnessActivities: [],
      
      inspirationNotes: [],
      
      pomodoroTime: 0,
      pomodoroRunning: false,
      pomodoroTarget: 45,
      
      githubToken: '',
      githubRepo: '',
      lastSyncTime: null,
      isDarkMode: true,
      
      // Task Actions
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: generateId(), createdAt: Date.now() }]
      })),
      
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      
      // Study Session Actions
      addStudySession: (session) => set((state) => ({
        studySessions: [...state.studySessions, { ...session, id: generateId() }]
      })),
      
      // Literature Actions
      addLiteratureRecord: (record) => set((state) => ({
        literatureRecords: [...state.literatureRecords, { ...record, id: generateId() }]
      })),
      
      // Word Count
      setWordCount: (count) => set({ wordCount: count }),
      
      setCountdownDate: (date, label) => set({ countdownDate: date, countdownLabel: label }),
      
      // Water Actions
      toggleWaterGlass: (index) => set((state) => {
        const newGlasses = [...state.waterGlasses];
        newGlasses[index] = !newGlasses[index];
        return { waterGlasses: newGlasses };
      }),
      
      resetWaterGlasses: () => set({ waterGlasses: [false, false, false, false, false, false, false, false] }),
      
      // Fitness Actions
      addFitnessActivity: (activity) => set((state) => ({
        fitnessActivities: [...state.fitnessActivities, { ...activity, id: generateId() }]
      })),
      
      toggleFitnessActivity: (id) => set((state) => ({
        fitnessActivities: state.fitnessActivities.map(a => 
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      })),
      
      // Inspiration Actions
      addInspirationNote: (note) => set((state) => ({
        inspirationNotes: [...state.inspirationNotes, { ...note, id: generateId(), createdAt: Date.now() }]
      })),
      
      deleteInspirationNote: (id) => set((state) => ({
        inspirationNotes: state.inspirationNotes.filter(n => n.id !== id)
      })),
      
      // Pomodoro Actions
      setPomodoroTime: (time) => set({ pomodoroTime: time }),
      setPomodoroRunning: (running) => set({ pomodoroRunning: running }),
      setPomodoroTarget: (target) => set({ pomodoroTarget: target }),
      
      // Config Actions
      setGithubConfig: (token, repo) => set({ githubToken: token, githubRepo: repo }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Sync Actions
      loadFromData: (data) => set((state) => ({ ...state, ...data })),
      
      getSyncData: () => {
        const state = get();
        return {
          tasks: state.tasks,
          studySessions: state.studySessions,
          literatureRecords: state.literatureRecords,
          wordCount: state.wordCount,
          countdownDate: state.countdownDate,
          countdownLabel: state.countdownLabel,
          waterGlasses: state.waterGlasses,
          fitnessActivities: state.fitnessActivities,
          inspirationNotes: state.inspirationNotes,
          pomodoroTarget: state.pomodoroTarget,
        };
      },
      
      resetDailyData: () => set({
        waterGlasses: [false, false, false, false, false, false, false, false],
        fitnessActivities: [],
        tasks: [],
      }),
    }),
    {
      name: 'research-life-os-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        studySessions: state.studySessions,
        literatureRecords: state.literatureRecords,
        wordCount: state.wordCount,
        countdownDate: state.countdownDate,
        countdownLabel: state.countdownLabel,
        waterGlasses: state.waterGlasses,
        fitnessActivities: state.fitnessActivities,
        inspirationNotes: state.inspirationNotes,
        pomodoroTarget: state.pomodoroTarget,
        githubToken: state.githubToken,
        githubRepo: state.githubRepo,
        lastSyncTime: state.lastSyncTime,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
