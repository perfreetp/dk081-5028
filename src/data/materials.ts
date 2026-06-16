import { MaterialItem } from '@/types';

export const materialList: MaterialItem[] = [
  {
    id: 'm1',
    name: '法定代表人身份证正反面',
    category: 'identity',
    categoryName: '身份证明',
    status: 'verified',
    needSign: false,
    signed: false,
    pages: 2,
    uploadTime: '2026-06-15 09:30'
  },
  {
    id: 'm2',
    name: '股东身份证复印件',
    category: 'identity',
    categoryName: '身份证明',
    status: 'uploaded',
    needSign: true,
    signed: false,
    pages: 1,
    uploadTime: '2026-06-15 10:15'
  },
  {
    id: 'm3',
    name: '房屋租赁合同',
    category: 'site',
    categoryName: '场地材料',
    status: 'need_sign',
    needSign: true,
    signed: false,
    pages: 6
  },
  {
    id: 'm4',
    name: '房东房产证复印件',
    category: 'site',
    categoryName: '场地材料',
    status: 'uploaded',
    needSign: false,
    signed: false,
    pages: 3,
    uploadTime: '2026-06-16 14:20'
  },
  {
    id: 'm5',
    name: '住所（经营场所）登记表',
    category: 'site',
    categoryName: '场地材料',
    status: 'rejected',
    needSign: true,
    signed: true,
    pages: 2,
    uploadTime: '2026-06-14 16:00',
    rejectReason: '产权人签字位置不正确，请在第2页右下角签名处重新签字'
  },
  {
    id: 'm6',
    name: '公司章程',
    category: 'auth',
    categoryName: '授权文书',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 12
  },
  {
    id: 'm7',
    name: '股东会决议',
    category: 'auth',
    categoryName: '授权文书',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2
  },
  {
    id: 'm8',
    name: '指定代表或委托代理人授权书',
    category: 'auth',
    categoryName: '授权文书',
    status: 'uploaded',
    needSign: true,
    signed: true,
    pages: 1,
    uploadTime: '2026-06-15 15:40'
  }
];

export const categoryColors: Record<string, string> = {
  identity: '#1677ff',
  site: '#52c41a',
  auth: '#722ed1',
  other: '#fa8c16'
};
