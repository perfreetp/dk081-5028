import { create } from 'zustand';
import { AppState, MaterialItem, TaskItem, MessageItem, EnterpriseInfo } from '@/types';
import Taro from '@tarojs/taro';
import { taskList as initialTaskList } from '@/data/tasks';
import { materialList as initialMaterialList } from '@/data/materials';
import { messageList as initialMessageList } from '@/data/messages';
import { expandDynamicMaterials } from '@/utils/materialUtils';

const STORAGE_KEY = 'yizhangtong_app_state_v1';

interface PersistState {
  isElderlyMode: boolean;
  currentQuestionGroupIndex: number;
  answers: Record<string, string | string[]>;
  materials: MaterialItem[];
  tasks: TaskItem[];
  messages: MessageItem[];
  enterpriseInfo: EnterpriseInfo;
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
      messages: state.messages,
      enterpriseInfo: state.enterpriseInfo
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(persistData));
    console.log('[Store] 状态已保存到本地存储');
  } catch (e) {
    console.error('[Store] 保存本地存储失败:', e);
  }
};

const stored = loadFromStorage();

export const useAppStore = create<AppState>((set, get) => ({
  enterpriseInfo: stored.enterpriseInfo ?? {},
  updateEnterpriseInfo: (info: Partial<EnterpriseInfo>) => {
    set((state) => ({
      enterpriseInfo: { ...state.enterpriseInfo, ...info }
    }));
    saveToStorage(get());
    console.log('[Store] 企业信息已更新:', info);
  },

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

  materials: initialMaterialList.map(im => {
    const existed = stored.materials?.find(sm => sm.id === im.id);
    return existed
      ? { ...im, status: existed.status, signed: existed.signed, uploadTime: existed.uploadTime, rejectReason: existed.rejectReason, submitTime: existed.submitTime }
      : im;
  }),
  updateMaterialStatus: (materialId: string, status: MaterialItem['status'], signed?: boolean, options?: { rejectReason?: string }) => {
    set((state) => ({
      materials: state.materials.map(m => {
        if (m.id === materialId) {
          const now = new Date();
          const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const shouldClearReject = status !== 'rejected';
          const shouldUpdateUploadTime = status === 'uploaded' || status === 'need_sign';
          const shouldUpdateSubmitTime = status === 'in_review';
          return {
            ...m,
            status,
            signed: signed !== undefined ? signed : m.signed,
            uploadTime: shouldUpdateUploadTime ? timeStr : m.uploadTime,
            submitTime: shouldUpdateSubmitTime ? timeStr : m.submitTime,
            rejectReason: options?.rejectReason ?? (shouldClearReject ? undefined : m.rejectReason)
          };
        }
        return m;
      })
    }));
    saveToStorage(get());
    console.log('[Store] 材料状态已更新:', materialId, status);
  },
  submitMaterialsForReview: () => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    set((state) => ({
      materials: state.materials.map(m => {
        if (m.status === 'uploaded' || m.status === 'need_sign' || m.status === 'verified') {
          return { ...m, status: 'in_review' as const, submitTime: timeStr };
        }
        return m;
      })
    }));

    const state = get();
    const submittedCount = state.materials.filter(m => m.status === 'in_review').length;
    if (submittedCount > 0) {
      const newMsg = {
        id: `msg_progress_${Date.now()}`,
        title: '材料已提交审核',
        content: `您已提交 ${submittedCount} 份材料进入审核，通常1-2个工作日内完成审核。`,
        type: 'progress' as const,
        time: timeStr,
        read: false,
        actionText: '查看审核进度',
        actionPage: '/pages/messages/index'
      };
      set(s => ({ messages: [newMsg, ...s.messages] }));
    }
    saveToStorage(get());
    console.log('[Store] 材料已提交审核');
    return submittedCount;
  },
  rejectMaterial: (materialId: string, reason: string) => {
    const state = get();
    const material = state.materials.find(m => m.id === materialId);
    if (!material) return;

    set(s => ({
      materials: s.materials.map(m =>
        m.id === materialId
          ? { ...m, status: 'rejected' as const, rejectReason: reason }
          : m
      )
    }));

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: `msg_reject_${Date.now()}`,
      title: '材料审核未通过',
      content: `【${material.name}】${reason}`,
      type: 'reject' as const,
      time: timeStr,
      read: false,
      actionText: '重新上传',
      actionPage: '/pages/materials/index'
    };

    set(s => ({ messages: [newMsg, ...s.messages] }));
    saveToStorage(get());
    console.log('[Store] 材料已退回:', materialId, reason);
  },

  tasks: stored.tasks ?? initialTaskList,
  updateTaskProgress: (taskIdOrCategory: string, progress: number, status?: TaskItem['status']) => {
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskIdOrCategory || t.category === taskIdOrCategory) {
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
    console.log('[Store] 任务进度已更新:', taskIdOrCategory, progress, status);
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

  syncDynamicMaterials: (answers: Record<string, string | string[]>) => {
    const state = get();
    const existingById = new Map(state.materials.map(m => [m.id, m]));
    const expanded = expandDynamicMaterials(initialMaterialList, answers);

    const merged = expanded.map(newMat => {
      const existing = existingById.get(newMat.id);
      if (existing) {
        return { ...newMat, status: existing.status, signed: existing.signed, uploadTime: existing.uploadTime, rejectReason: existing.rejectReason };
      }
      return newMat;
    });

    const changed = JSON.stringify(merged.map(m => ({ id: m.id, status: m.status }))) !==
                    JSON.stringify(state.materials.map(m => ({ id: m.id, status: m.status })));

    if (changed) {
      set({ materials: merged });
      saveToStorage(get());
      console.log('[Store] 动态材料已同步，总数:', merged.length);
    }
  },

  resetAll: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEY);
    } catch (e) {
      console.error('[Store] 清除本地存储失败:', e);
    }
    set({
      enterpriseInfo: {},
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
        enterpriseInfo: storedData.enterpriseInfo ?? {},
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
