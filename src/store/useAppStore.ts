import { create } from 'zustand';
import { AppState, MaterialItem, TaskItem, MessageItem } from '@/types';
import Taro from '@tarojs/taro';
import { taskList as initialTaskList } from '@/data/tasks';
import { materialList as initialMaterialList } from '@/data/materials';
import { messageList as initialMessageList } from '@/data/messages';

const STORAGE_KEY = 'yizhangtong_app_state_v1';

interface PersistState {
  isElderlyMode: boolean;
  currentQuestionGroupIndex: number;
  answers: Record<string, string | string[]>;
  materials: MaterialItem[];
  tasks: TaskItem[];
  messages: MessageItem[];
}

const loadFromStorage = (): Partial<PersistState> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      console.log('[Store] 从本地存储加载状态');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Store] 读取本地存储失败:', e);
  }
  return {};
};

const saveToStorage = (state: PersistState) => {
  try {
    const persistData: PersistState = {
      isElderlyMode: state.isElderlyMode,
      currentQuestionGroupIndex: state.currentQuestionGroupIndex,
      answers: state.answers,
      materials: state.materials,
      tasks: state.tasks,
      messages: state.messages
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(persistData));
    console.log('[Store] 状态已保存到本地存储');
  } catch (e) {
    console.error('[Store] 保存本地存储失败:', e);
  }
};

const stored = loadFromStorage();

export const useAppStore = create<AppState>((set, get) => ({
  isElderlyMode: stored.isElderlyMode ?? false,
  toggleElderlyMode: () => {
    const newValue = !get().isElderlyMode;
    set({ isElderlyMode: newValue });
    saveToStorage(get());
  },

  currentQuestionGroupIndex: stored.currentQuestionGroupIndex ?? 0,
  setCurrentQuestionGroupIndex: (index: number) => {
    set({ currentQuestionGroupIndex: index });
    saveToStorage(get());
  },

  answers: stored.answers ?? {},
  setAnswer: (questionId: string, value: string | string[]) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: value }
    }));
    saveToStorage(get());
  },

  materials: stored.materials ?? initialMaterialList,
  updateMaterialStatus: (materialId: string, status: MaterialItem['status'], signed?: boolean) => {
    set((state) => ({
      materials: state.materials.map(m => {
        if (m.id === materialId) {
          const now = new Date();
          const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          return {
            ...m,
            status,
            signed: signed !== undefined ? signed : m.signed,
            uploadTime: status === 'uploaded' ? timeStr : m.uploadTime
          };
        }
        return m;
      })
    }));
    saveToStorage(get());
    console.log('[Store] 材料状态已更新:', materialId, status);
  },

  tasks: stored.tasks ?? initialTaskList,
  updateTaskProgress: (taskId: string, progress: number, status?: TaskItem['status']) => {
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            progress,
            status: status ?? (progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : t.status)
          };
        }
        return t;
      })
    }));
    saveToStorage(get());
    console.log('[Store] 任务进度已更新:', taskId, progress, status);
  },

  messages: stored.messages ?? initialMessageList,
  markMessageRead: (messageId: string) => {
    set((state) => ({
      messages: state.messages.map(m =>
        m.id === messageId ? { ...m, read: true } : m
      )
    }));
    saveToStorage(get());
  },
  markAllMessagesRead: () => {
    set((state) => ({
      messages: state.messages.map(m => ({ ...m, read: true }))
    }));
    saveToStorage(get());
    console.log('[Store] 所有消息已标为已读');
  },

  currentTaskGuide: null,
  setCurrentTaskGuide: (task: TaskItem | null) => {
    set({ currentTaskGuide: task });
  },

  resetAll: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEY);
    } catch (e) {
      console.error('[Store] 清除本地存储失败:', e);
    }
    set({
      isElderlyMode: false,
      currentQuestionGroupIndex: 0,
      answers: {},
      materials: initialMaterialList,
      tasks: initialTaskList,
      messages: initialMessageList,
      currentTaskGuide: null
    });
    console.log('[Store] 所有状态已重置');
  },

  hydrateFromStorage: () => {
    const storedData = loadFromStorage();
    if (Object.keys(storedData).length > 0) {
      set({
        isElderlyMode: storedData.isElderlyMode ?? false,
        currentQuestionGroupIndex: storedData.currentQuestionGroupIndex ?? 0,
        answers: storedData.answers ?? {},
        materials: storedData.materials ?? initialMaterialList,
        tasks: storedData.tasks ?? initialTaskList,
        messages: storedData.messages ?? initialMessageList
      });
      console.log('[Store] 已从本地存储恢复状态');
    }
  }
}));
