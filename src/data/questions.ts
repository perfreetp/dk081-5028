import { QuestionGroup, ConceptItem } from '@/types';

export const questionGroups: QuestionGroup[] = [
  {
    id: 'g1',
    title: '企业基本信息',
    description: '请先告诉我们您要设立什么样的企业',
    questions: [
      {
        id: 'q1',
        question: '您想使用的企业字号名称是什么？',
        type: 'text',
        placeholder: '如：星辰科技、海阔商贸',
        helpText: '字号是企业名称的核心部分，建议2-4个汉字',
        concept: 'same_name_check',
        required: true
      },
      {
        id: 'q2',
        question: '企业所属行业是什么？',
        type: 'select',
        options: [
          '信息技术服务业',
          '批发和零售业',
          '制造业',
          '商务服务业',
          '建筑业',
          '其他行业'
        ],
        required: true
      },
      {
        id: 'q3',
        question: '企业类型是？',
        type: 'select',
        options: [
          '有限责任公司（自然人独资）',
          '有限责任公司（自然人投资或控股）',
          '个体工商户',
          '合伙企业',
          '股份有限公司'
        ],
        helpText: '大多数小微企业选择"有限责任公司"',
        required: true
      },
      {
        id: 'q4',
        question: '预计注册资本是多少万元？',
        type: 'text',
        placeholder: '请填写数字，如：100',
        helpText: '现在实行认缴制，可根据实际情况填写',
        concept: 'registered_capital',
        required: true
      }
    ],
    progress: 75,
    completed: false
  },
  {
    id: 'g2',
    title: '经营范围',
    description: '告诉我们您的企业主要做什么业务',
    questions: [
      {
        id: 'q5',
        question: '主要经营业务是什么？',
        type: 'select',
        options: [
          '软件开发与技术服务',
          '商品销售与贸易',
          '咨询与管理服务',
          '建筑安装与工程',
          '生产加工制造'
        ],
        helpText: '选择最接近的一项，后续可补充细节',
        concept: 'business_scope',
        required: true
      },
      {
        id: 'q6',
        question: '是否涉及以下许可经营项目？',
        type: 'multi',
        options: [
          '食品经营许可',
          '医疗器械经营',
          '进出口贸易',
          '危险化学品',
          '劳务派遣',
          '以上都不涉及'
        ],
        required: false
      }
    ],
    progress: 0,
    completed: false
  },
  {
    id: 'g3',
    title: '股东与人员',
    description: '填写企业的股东和主要管理人员信息',
    questions: [
      {
        id: 'q7',
        question: '股东人数有多少？',
        type: 'select',
        options: ['仅1人（独资）', '2人', '3-5人', '5人以上'],
        required: true
      },
      {
        id: 'q8',
        question: '法定代表人姓名？',
        type: 'text',
        placeholder: '请输入真实姓名',
        required: true
      },
      {
        id: 'q9',
        question: '法定代表人身份证号码？',
        type: 'text',
        placeholder: '18位身份证号码',
        required: true
      },
      {
        id: 'q10',
        question: '是否聘请财务负责人？',
        type: 'select',
        options: ['是，已确定人选', '暂时没有，后续补充', '由股东兼任'],
        required: true
      }
    ],
    progress: 0,
    completed: false
  },
  {
    id: 'g4',
    title: '经营场所',
    description: '填写企业的注册地址信息',
    questions: [
      {
        id: 'q11',
        question: '注册地址所在区域？',
        type: 'picker',
        options: ['北京市-朝阳区', '北京市-海淀区', '北京市-丰台区', '北京市-东城区', '其他地区'],
        required: true
      },
      {
        id: 'q12',
        question: '详细地址是？',
        type: 'text',
        placeholder: '如：建国路88号SOHO现代城A座1201室',
        helpText: '需与房产证明地址完全一致',
        required: true
      },
      {
        id: 'q13',
        question: '场地使用性质？',
        type: 'select',
        options: ['自有房产', '租赁商用房', '园区工位', '虚拟地址（集中登记）', '住宅改商用'],
        concept: 'site_type',
        required: true
      }
    ],
    progress: 0,
    completed: false
  },
  {
    id: 'g5',
    title: '社保与发票',
    description: '办理社保登记和发票申请的必要信息',
    questions: [
      {
        id: 'q14',
        question: '是否同步办理社保登记？',
        type: 'select',
        options: ['是，同步办理', '暂不办理，后续开通'],
        required: true
      },
      {
        id: 'q15',
        question: '需要申请什么类型的发票？',
        type: 'multi',
        options: ['增值税普通发票（电子版）', '增值税普通发票（纸质版）', '增值税专用发票'],
        helpText: '建议先选择电子普通发票，使用更方便',
        required: true
      },
      {
        id: 'q16',
        question: '预计每月开票金额约多少？',
        type: 'select',
        options: ['10万以下', '10万-50万', '50万-100万', '100万以上'],
        required: true
      }
    ],
    progress: 0,
    completed: false
  }
];

export const conceptList: ConceptItem[] = [
  {
    key: 'same_name_check',
    title: '什么是"同名企业"？',
    content: '同名企业是指与您拟使用的字号相同或近似的已注册企业。如果存在高度近似的名称，系统会自动提醒您修改，以避免后续被驳回。建议准备2-3个备选字号。'
  },
  {
    key: 'registered_capital',
    title: '注册资本怎么填合适？',
    content: '注册资本现在是"认缴制"，不需要实缴到账。填写金额应考虑：1）业务需要（如招投标可能有要求）；2）承担责任范围（注册资本越大，股东责任越大）；3）印花税成本（按万分之2.5缴纳）。小微企业一般建议填50-500万。'
  },
  {
    key: 'business_scope',
    title: '经营范围怎么选？',
    content: '经营范围是企业可以从事的业务活动清单。填写时注意：1）第一项为主营业务，影响税种认定；2）并非越多越好，避免不必要的审批；3）特殊行业需要前置许可（如食品、医疗）。系统会根据您的选择自动匹配标准规范用语。'
  },
  {
    key: 'site_type',
    title: '注册地址有什么要求？',
    content: '注册地址是企业营业执照上登记的"住址"。不同类型各有特点：1）商用房：最稳妥，需提供房产证+租赁合同；2）园区工位：适合初创企业，成本较低；3）虚拟地址：由园区提供，仅用于注册不可实际办公；4）住宅：需经居委会同意改商用。'
  }
];
