import { create } from 'zustand';
import { AppState } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  isElderlyMode: false,
  toggleElderlyMode: () => set((state) => ({ isElderlyMode: !state.isElderlyMode })),
  currentQuestionGroupIndex: 0,
  setCurrentQuestionGroupIndex: (index: number) => set({ currentQuestionGroupIndex: index }),
  answers: {},
  setAnswer: (questionId: string, value: string | string[]) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value }
    }))
}));
