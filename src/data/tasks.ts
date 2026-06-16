import { TaskItem } from '@/types';

export const taskList: TaskItem[] = [
  {
    id: 't1',
    title: '营业执照设立登记',
    description: '完成企业名称、经营范围、注册资本等信息填报',
    status: 'in_progress',
    progress: 65,
    category: 'license',
    deadline: '2026-06-20',
    priority: 'high'
  },
  {
    id: 't2',
    title: '发票票种核定申请',
    description: '确定发票种类、开票限额和领用数量',
    status: 'pending',
    progress: 0,
    category: 'invoice',
    priority: 'medium'
  },
  {
    id: 't3',
    title: '社保单位参保登记',
    description: '企业社保账户开立，填写参保基本信息',
    status: 'pending',
    progress: 0,
    category: 'social',
    priority: 'medium'
  },
  {
    id: 't4',
    title: '税务信息确认',
    description: '确认税务主管机关、税种认定等信息',
    status: 'pending',
    progress: 0,
    category: 'tax',
    priority: 'medium'
  },
  {
    id: 't5',
    title: '银行账户预约开户',
    description: '预约附近银行网点，开立企业对公账户',
    status: 'pending',
    progress: 0,
    category: 'bank',
    priority: 'low'
  }
];

export const categoryNames: Record<string, string> = {
  license: '营业执照',
  invoice: '发票申请',
  social: '社保登记',
  tax: '税务登记',
  bank: '银行开户'
};
