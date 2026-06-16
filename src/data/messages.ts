import { MessageItem, TimelineItem, ReminderItem, MemberItem, LicenseItem } from '@/types';

export const messageList: MessageItem[] = [
  {
    id: 'msg1',
    type: 'reject',
    typeName: '退回补正',
    title: '经营场所登记表需要补正',
    content: '您提交的《住所（经营场所）登记表》中产权人签字位置不正确，请在第2页右下角签名处重新签字后上传。',
    time: '今天 14:30',
    read: false,
    actionText: '去修改',
    actionPage: '/pages/materials/index'
  },
  {
    id: 'msg2',
    type: 'progress',
    typeName: '办理进度',
    title: '营业执照申请已受理',
    content: '您的企业设立登记申请已被市场监管局受理，预计1-2个工作日内完成审核。请保持手机畅通。',
    time: '今天 10:15',
    read: false,
    actionText: '查看进度',
    actionPage: '/pages/messages/index'
  },
  {
    id: 'msg3',
    type: 'reminder',
    typeName: '开业提醒',
    title: '刻章领取提醒',
    content: '您的企业公章、财务章、法人章已刻制完成，请到海淀区政务服务中心2层12号窗口领取，携带身份证原件。',
    time: '昨天 16:00',
    read: true,
    actionText: '导航前往',
    actionPage: '/pages/enterprise/index'
  },
  {
    id: 'msg4',
    type: 'notification',
    typeName: '系统通知',
    title: '企业名称核准通过',
    content: '您申报的企业名称"北京星辰科技有限公司"已通过名称预核准，有效期至2026年9月15日，请在此之前完成设立登记。',
    time: '06-15 09:00',
    read: true
  },
  {
    id: 'msg5',
    type: 'progress',
    typeName: '办理进度',
    title: '财务联系人信息已补充',
    content: '您邀请的财务联系人李明已完成个人信息填报和身份核验，可以继续办理流程了。',
    time: '06-14 18:20',
    read: true
  },
  {
    id: 'msg6',
    type: 'reminder',
    typeName: '开业提醒',
    title: '税务报到提醒',
    content: '您的企业营业执照已办结，请在30日内完成税务报到。我们已为您预约了主管税务机关的线下办理时间。',
    time: '06-14 10:00',
    read: true,
    actionText: '查看详情',
    actionPage: '/pages/enterprise/index'
  }
];

export const timelineList: TimelineItem[] = [
  {
    id: 'tl1',
    title: '企业名称预核准',
    status: 'done',
    time: '06-15 09:00',
    description: '名称核准通过：北京星辰科技有限公司'
  },
  {
    id: 'tl2',
    title: '在线填报信息',
    status: 'done',
    time: '06-15 11:30',
    description: '已完成基础信息填写，进度 65%'
  },
  {
    id: 'tl3',
    title: '材料提交审核',
    status: 'active',
    time: '06-16 14:30',
    description: '正在人工审核中，有1项材料需要补正'
  },
  {
    id: 'tl4',
    title: '设立登记审批',
    status: 'pending',
    time: '待完成'
  },
  {
    id: 'tl5',
    title: '领取营业执照',
    status: 'pending',
    time: '待完成'
  },
  {
    id: 'tl6',
    title: '刻章与税务报到',
    status: 'pending',
    time: '待完成'
  }
];

export const reminderList: ReminderItem[] = [
  {
    id: 'r1',
    title: '领取企业公章',
    date: '2026-06-18',
    description: '携带身份证原件到海淀区政务服务中心2层12号窗口领取',
    type: 'seal',
    done: false
  },
  {
    id: 'r2',
    title: '完成税务报到',
    date: '2026-07-05',
    description: '营业执照办结后30日内完成，已为您预约主管税务所',
    type: 'tax',
    done: false
  },
  {
    id: 'r3',
    title: '预约银行开户',
    date: '2026-06-25',
    description: '已匹配附近3家银行网点，可选择时间预约办理对公账户',
    type: 'bank',
    done: false
  },
  {
    id: 'r4',
    title: '社保账户开通',
    date: '2026-06-30',
    description: '员工入职前需完成社保登记，避免断缴影响员工权益',
    type: 'social',
    done: false
  }
];

export const memberList: MemberItem[] = [
  {
    id: 'mem1',
    name: '张伟',
    role: 'legal',
    roleName: '法定代表人',
    phone: '138****8888',
    idCardMask: '110108********1234',
    infoCompleted: true
  },
  {
    id: 'mem2',
    name: '王芳',
    role: 'shareholder',
    roleName: '股东（持股60%）',
    phone: '139****6666',
    idCardMask: '110105********5678',
    infoCompleted: true
  },
  {
    id: 'mem3',
    name: '李明',
    role: 'finance',
    roleName: '财务负责人',
    phone: '136****9999',
    idCardMask: '110101********9012',
    infoCompleted: true
  },
  {
    id: 'mem4',
    name: '赵强',
    role: 'shareholder',
    roleName: '股东（持股40%）',
    phone: '137****3333',
    idCardMask: '待补充',
    infoCompleted: false
  }
];

export const licenseList: LicenseItem[] = [
  {
    id: 'lic1',
    name: '企业名称核准通知书',
    type: '名称核准',
    issueDate: '2026-06-15',
    expireDate: '2026-09-15',
    status: 'valid'
  }
];
