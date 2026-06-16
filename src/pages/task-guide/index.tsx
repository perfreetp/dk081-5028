import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { TaskItem } from '@/types';
import { categoryNames } from '@/data/tasks';
import classnames from 'classnames';

interface StepGuide {
  id: string;
  title: string;
  description: string;
  tip?: string;
  actionText?: string;
  progressIncrement: number;
}

interface TaskGuideConfig {
  icon: string;
  title: string;
  description: string;
  steps: StepGuide[];
  tip?: { title: string; content: string };
}

const taskGuideConfigs: Record<string, TaskGuideConfig> = {
  invoice: {
    icon: '📄',
    title: '发票票种申请',
    description: '完成后您的企业可正常开具增值税发票',
    tip: {
      title: '办理须知',
      content: '1. 首次申请发票前，请确保已完成税务报到\n2. 需法定代表人或办税人员本人完成实名认证\n3. 首次申请专票需主管税务机关审批'
    },
    steps: [
      { id: 'i1', title: '确认办税人员信息', description: '填写办税人员姓名、身份证号、手机号，完成实名认证绑定', actionText: '去确认', progressIncrement: 25 },
      { id: 'i2', title: '选择发票种类与数量', description: '选择增值税专用发票/普通发票，填写月购票数量和最高开票限额', actionText: '去选择', progressIncrement: 25 },
      { id: 'i3', title: '确认开票设备信息', description: '选择税控设备品牌（金税盘/税控盘/税务UKey），填写领用方式', actionText: '去确认', progressIncrement: 25 },
      { id: 'i4', title: '提交申请并预约领取', description: '提交信息后，待税务机关审核通过，预约时间领取税控设备和发票', actionText: '提交申请', progressIncrement: 25 }
    ]
  },
  social: {
    icon: '👥',
    title: '社保登记与开户',
    description: '完成后企业可为员工正常缴纳社会保险',
    tip: {
      title: '办理须知',
      content: '1. 企业营业执照领取后30日内需完成社保登记\n2. 需明确社保缴费人员名单和缴费基数\n3. 首次登记后每月15日前需完成社保申报缴费'
    },
    steps: [
      { id: 's1', title: '确认企业基本信息', description: '核对企业统一社会信用代码、注册地址、法定代表人等信息', actionText: '去确认', progressIncrement: 20 },
      { id: 's2', title: '填写参保人员信息', description: '录入首次参保员工姓名、身份证号、手机号、缴费基数等信息', actionText: '去填写', progressIncrement: 30 },
      { id: 's3', title: '确定缴费银行账户', description: '填写社保缴费对公账户信息，签订三方代扣代缴协议', actionText: '去设置', progressIncrement: 25 },
      { id: 's4', title: '提交审核并领取社保登记证', description: '提交信息后，待社保经办机构审核，领取电子社保登记证', actionText: '提交申请', progressIncrement: 25 }
    ]
  },
  tax: {
    icon: '💼',
    title: '税务信息确认与报到',
    description: '完成税种核定、财务会计制度备案等税务初始化',
    tip: {
      title: '办理须知',
      content: '1. 企业应在领取营业执照之日起30日内办理税务报到\n2. 需确定企业为小规模纳税人或一般纳税人\n3. 需完成财务会计制度和核算软件备案'
    },
    steps: [
      { id: 't1', title: '确认企业基本税务信息', description: '核对经营范围、注册资本、经营地址等信息，确认主管税务机关', actionText: '去确认', progressIncrement: 25 },
      { id: 't2', title: '选择纳税人资格', description: '根据企业经营情况，选择登记为小规模纳税人或申请一般纳税人', actionText: '去选择', progressIncrement: 25 },
      { id: 't3', title: '备案财务会计制度', description: '选择企业适用的会计制度（小企业会计准则/企业会计准则），备案财务软件', actionText: '去备案', progressIncrement: 25 },
      { id: 't4', title: '完成存款账户账号报告', description: '填写企业银行基本户信息，签订税库银三方协议，完成税务报到', actionText: '完成报到', progressIncrement: 25 }
    ]
  },
  bank: {
    icon: '🏦',
    title: '银行基本存款账户预约开户',
    description: '预约银行网点开立企业基本存款账户',
    tip: {
      title: '办理须知',
      content: '1. 基本存款账户是企业办理日常转账结算和现金收付的账户\n2. 开立基本户需法定代表人或授权代理人到场办理\n3. 开户完成后需及时到税务机关完成存款账户账号报告'
    },
    steps: [
      { id: 'b1', title: '选择开户银行与网点', description: '根据企业经营地址和业务需求，选择合适的银行和就近网点', actionText: '去选择', progressIncrement: 25 },
      { id: 'b2', title: '填写企业开户信息', description: '填写企业名称、统一社会信用代码、法定代表人、经营范围等信息', actionText: '去填写', progressIncrement: 25 },
      { id: 'b3', title: '上传开户证明材料', description: '上传营业执照、法定代表人身份证、公章印模等开户所需材料', actionText: '去上传', progressIncrement: 25 },
      { id: 'b4', title: '预约开户时间', description: '选择法定代表人或授权代理人可到场的时间，完成开户预约', actionText: '预约开户', progressIncrement: 25 }
    ]
  },
  license: {
    icon: '🏢',
    title: '营业执照设立登记',
    description: '完成企业名称申报、工商登记信息填写',
    steps: [
      { id: 'l1', title: '企业名称自主申报', description: '选择行业表述、组织形式，进行名称查重，确认可用名称', actionText: '去申报', progressIncrement: 20 },
      { id: 'l2', title: '填写企业基本信息', description: '填写注册资本、经营范围、经营期限、股东信息等', actionText: '去填写', progressIncrement: 30 },
      { id: 'l3', title: '确认人员信息', description: '填写法定代表人、监事、财务负责人等任职人员信息', actionText: '去确认', progressIncrement: 25 },
      { id: 'l4', title: '提交电子签名', description: '所有相关人员完成电子签名后提交工商审核', actionText: '去签名', progressIncrement: 25 }
    ]
  }
};

const TaskGuidePage: React.FC = () => {
  const { isElderlyMode, tasks, updateTaskProgress, setCurrentTaskGuide, currentTaskGuide, hydrateFromStorage } = useAppStore();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const task = currentTaskGuide;
  const taskId = task?.id || '';

  useEffect(() => {
    if (task) {
      Taro.setNavigationBarTitle({ title: categoryNames[task.category] || '任务引导' });
    }
  }, [task]);

  const config = task ? taskGuideConfigs[task.category] : null;
  const currentTaskFromStore = tasks.find(t => t.id === taskId) || task;

  const stepProgress = useMemo(() => {
    if (!config) return 0;
    let progress = 0;
    config.steps.forEach(step => {
      if (completedSteps[`${taskId}_${step.id}`]) {
        progress += step.progressIncrement;
      }
    });
    return progress;
  }, [config, completedSteps, taskId]);

  const handleStepComplete = (step: StepGuide, index: number) => {
    console.log('[TaskGuide] 完成步骤:', step.id);
    const stepKey = `${taskId}_${step.id}`;
    if (completedSteps[stepKey]) return;

    const newCompleted = { ...completedSteps, [stepKey]: true };
    setCompletedSteps(newCompleted);

    let totalProgress = 0;
    config?.steps.forEach(s => {
      if (newCompleted[`${taskId}_${s.id}`]) {
        totalProgress += s.progressIncrement;
      }
    });

    if (taskId) {
      const newStatus = totalProgress >= 100 ? 'completed' : 'in_progress';
      updateTaskProgress(taskId, totalProgress, newStatus);
    }

    if (step.id === 'i4' || step.id === 's4' || step.id === 't4' || step.id === 'b4' || step.id === 'l4') {
      Taro.showModal({
        title: '任务已完成',
        content: `您已完成${config?.title}的所有步骤，进度100%。`,
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      Taro.showToast({ title: `步骤${index + 1}已完成`, icon: 'success' });
    }
  };

  const handleBack = () => {
    setCurrentTaskGuide(null);
    Taro.switchTab({ url: '/pages/todo/index' });
  };

  if (!task || !config) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>ℹ️</Text>
          <View className={styles.tipContent}>
            <Text className={styles.tipTitle}>请从待办首页选择任务</Text>
            <Text className={styles.tipText}>返回待办首页，点击任意任务卡片进入对应的办理引导。</Text>
          </View>
        </View>
        <Button className={styles.backBtn} onClick={handleBack}>返回待办首页</Button>
      </ScrollView>
    );
  }

  const actualProgress = currentTaskFromStore?.progress || stepProgress;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.taskHeader}>
        <Text className={styles.taskIcon}>{config.icon}</Text>
        <Text className={classnames(styles.taskTitle, isElderlyMode && 'elderly-zoom-subtitle')}>{config.title}</Text>
        <Text className={classnames(styles.taskDesc, isElderlyMode && 'elderly-zoom-small')}>{config.description}</Text>
        <View className={styles.progressRow}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${actualProgress}%` }} />
          </View>
          <Text className={styles.progressText}>{actualProgress}%</Text>
        </View>
      </View>

      {config.tip && (
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>ℹ️</Text>
          <View className={styles.tipContent}>
            <Text className={classnames(styles.tipTitle, isElderlyMode && 'elderly-zoom-text')}>{config.tip.title}</Text>
            <Text className={classnames(styles.tipText, isElderlyMode && 'elderly-zoom-small')}>{config.tip.content}</Text>
          </View>
        </View>
      )}

      {config.steps.map((step, index) => {
        const stepKey = `${taskId}_${step.id}`;
        const isStepDone = completedSteps[stepKey];
        const activeSteps = config.steps.filter((s, i) => {
          const sk = `${taskId}_${s.id}`;
          return !completedSteps[sk];
        });
        const isActive = activeSteps[0]?.id === step.id;
        const canEdit = index === 0 || completedSteps[`${taskId}_${config.steps[index - 1].id}`];

        return (
          <View
            key={step.id}
            className={classnames(
              styles.stepCard,
              isStepDone && styles.completed,
              isActive && !isStepDone && styles.active
            )}
          >
            <View className={styles.stepHeader}>
              <View className={classnames(styles.stepNumber, isStepDone && styles.completed, isActive && !isStepDone && styles.active)}>
                {isStepDone ? '✓' : index + 1}
              </View>
              <View className={styles.stepContent}>
                <Text className={classnames(styles.stepTitle, isElderlyMode && 'elderly-zoom-text')}>
                  {step.title}
                </Text>
                <Text className={classnames(styles.stepDesc, isElderlyMode && 'elderly-zoom-small')}>
                  {step.description}
                </Text>
              </View>
            </View>
            <View className={styles.stepAction}>
              {isStepDone ? (
                <Button className={styles.completedBtn} disabled>✓ 已完成</Button>
              ) : canEdit ? (
                <>
                  <Button
                    className={styles.outlineBtn}
                    onClick={() => Taro.showToast({ title: '查看详情', icon: 'none' })}
                  >
                    查看详情
                  </Button>
                  <Button
                    className={styles.primaryBtn}
                    onClick={() => handleStepComplete(step, index)}
                  >
                    {step.actionText || '去完成'}
                  </Button>
                </>
              ) : (
                <Button className={styles.outlineBtn} disabled>请先完成上一步</Button>
              )}
            </View>
          </View>
        );
      })}

      <Button className={styles.backBtn} onClick={handleBack}>返回待办首页</Button>
    </ScrollView>
  );
};

export default TaskGuidePage;
