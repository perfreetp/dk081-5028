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
    uploadTime: '2026-06-15 10:15',
    dynamicSuffix: '_shareholder_count',
    conditions: [
      { questionId: 'q7', anyOf: ['2人', '3-5人', '5人以上'] },
      { questionId: 'q3', noneOf: ['个体工商户'] }
    ]
  },
  {
    id: 'm3',
    name: '房屋租赁合同',
    category: 'site',
    categoryName: '场地材料',
    status: 'need_sign',
    needSign: true,
    signed: false,
    pages: 6,
    conditions: [
      { questionId: 'q13', anyOf: ['租赁商用房', '住宅改商用'] }
    ]
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
    uploadTime: '2026-06-16 14:20',
    conditions: [
      { questionId: 'q13', anyOf: ['租赁商用房', '住宅改商用', '自有房产'] }
    ]
  },
  {
    id: 'm4b',
    name: '园区工位使用证明',
    category: 'site',
    categoryName: '场地材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q13', anyOf: ['园区工位'] }
    ]
  },
  {
    id: 'm4c',
    name: '集中登记地址使用授权书',
    category: 'site',
    categoryName: '场地材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q13', anyOf: ['虚拟地址（集中登记）'] }
    ]
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
    pages: 12,
    conditions: [
      { questionId: 'q3', noneOf: ['个体工商户'] }
    ]
  },
  {
    id: 'm7',
    name: '股东会决议',
    category: 'auth',
    categoryName: '授权文书',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q7', anyOf: ['2人', '3-5人', '5人以上'] },
      { questionId: 'q3', noneOf: ['个体工商户'] }
    ]
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
  },
  {
    id: 'm9',
    name: '合伙人协议',
    category: 'auth',
    categoryName: '授权文书',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 8,
    conditions: [
      { questionId: 'q3', anyOf: ['合伙企业'] }
    ]
  },
  {
    id: 'm10',
    name: '财务负责人身份证明',
    category: 'identity',
    categoryName: '身份证明',
    status: 'not_uploaded',
    needSign: false,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q10', anyOf: ['是，已确定人选'] }
    ]
  },
  {
    id: 'm11',
    name: '参保人员信息表',
    category: 'other',
    categoryName: '社保材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q14', anyOf: ['是，同步办理'] }
    ]
  },
  {
    id: 'm12',
    name: '税务银行三方协议',
    category: 'other',
    categoryName: '社保材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q14', anyOf: ['是，同步办理'] }
    ]
  },
  {
    id: 'm13',
    name: '发票票种核定表',
    category: 'other',
    categoryName: '发票材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q15', textNotEmpty: true }
    ]
  },
  {
    id: 'm14',
    name: '办税人员身份证明',
    category: 'other',
    categoryName: '发票材料',
    status: 'not_uploaded',
    needSign: false,
    signed: false,
    pages: 2,
    conditions: [
      { questionId: 'q15', textNotEmpty: true }
    ]
  },
  {
    id: 'm15',
    name: '住宅改商用证明',
    category: 'site',
    categoryName: '场地材料',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 3,
    conditions: [
      { questionId: 'q13', anyOf: ['住宅改商用'] }
    ]
  },
  {
    id: 'm16',
    name: '个体工商户登记申请书',
    category: 'auth',
    categoryName: '授权文书',
    status: 'not_uploaded',
    needSign: true,
    signed: false,
    pages: 4,
    conditions: [
      { questionId: 'q3', anyOf: ['个体工商户'] }
    ]
  }
];

export const categoryColors: Record<string, string> = {
  identity: '#1677ff',
  site: '#52c41a',
  auth: '#722ed1',
  other: '#fa8c16'
};
