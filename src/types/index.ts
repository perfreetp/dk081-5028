export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  progress: number;
  category: 'license' | 'invoice' | 'social' | 'tax' | 'bank';
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface QuestionItem {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multi' | 'date' | 'picker';
  options?: string[];
  placeholder?: string;
  helpText?: string;
  concept?: string;
  required: boolean;
}

export interface QuestionGroup {
  id: string;
  title: string;
  description: string;
  questions: QuestionItem[];
  progress: number;
  completed: boolean;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: 'identity' | 'site' | 'auth' | 'other';
  categoryName: string;
  status: 'not_uploaded' | 'uploaded' | 'need_sign' | 'verified' | 'rejected';
  needSign: boolean;
  signed: boolean;
  pages: number;
  uploadTime?: string;
  rejectReason?: string;
}

export interface MessageItem {
  id: string;
  type: 'progress' | 'notification' | 'reminder' | 'reject';
  typeName: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  actionText?: string;
  actionPage?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  status: 'done' | 'active' | 'pending';
  time: string;
  description?: string;
}

export interface MemberItem {
  id: string;
  name: string;
  role: 'legal' | 'shareholder' | 'finance' | 'other';
  roleName: string;
  phone: string;
  idCardMask: string;
  infoCompleted: boolean;
}

export interface LicenseItem {
  id: string;
  name: string;
  type: string;
  issueDate: string;
  expireDate: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'seal' | 'tax' | 'bank' | 'social';
  done: boolean;
}

export interface ConceptItem {
  key: string;
  title: string;
  content: string;
}

export interface AppState {
  isElderlyMode: boolean;
  toggleElderlyMode: () => void;

  currentQuestionGroupIndex: number;
  setCurrentQuestionGroupIndex: (index: number) => void;
  answers: Record<string, string | string[]>;
  setAnswer: (questionId: string, value: string | string[]) => void;

  materials: MaterialItem[];
  updateMaterialStatus: (materialId: string, status: MaterialItem['status'], signed?: boolean) => void;

  tasks: TaskItem[];
  updateTaskProgress: (taskId: string, progress: number, status?: TaskItem['status']) => void;

  messages: MessageItem[];
  markMessageRead: (messageId: string) => void;
  markAllMessagesRead: () => void;

  currentTaskGuide: TaskItem | null;
  setCurrentTaskGuide: (task: TaskItem | null) => void;

  resetAll: () => void;
  hydrateFromStorage: () => void;
}
