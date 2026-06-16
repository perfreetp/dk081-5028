import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ProgressCard from '@/components/ProgressCard';
import TaskItem from '@/components/TaskItem';
import { useAppStore } from '@/store/useAppStore';
import classnames from 'classnames';

type TabType = 'all' | 'urgent' | 'in_progress' | 'pending';

const TodoPage: React.FC = () => {
  const { isElderlyMode, tasks, materials, messages, hydrateFromStorage } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const unreadCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const rejectCount = useMemo(() => messages.filter(m => m.type === 'reject' && !m.read).length, [messages]);

  const materialsDone = useMemo(() => materials.filter(
    m => m.status === 'verified' || m.status === 'uploaded' || m.status === 'need_sign' || m.status === 'in_review'
  ).length, [materials]);

  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'urgent':
        return tasks.filter(t => t.priority === 'high' || t.status === 'rejected');
      case 'in_progress':
        return tasks.filter(t => t.status === 'in_progress');
      case 'pending':
        return tasks.filter(t => t.status === 'pending');
      default:
        return tasks;
    }
  }, [activeTab, tasks]);

  const handleRefresh = () => {
    console.log('[TodoPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '已刷新', icon: 'success' });
    }, 800);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('__taroPullDownRefresh', handleRefresh);
    };
  }, []);

  const quickActions = [
    { icon: '📝', label: '继续填报', color: 'blue', page: '/pages/assistant/index' },
    { icon: '📷', label: '拍照上传', color: 'green', page: '/pages/materials/index' },
    { icon: '👥', label: '邀请成员', color: 'orange', page: '/pages/enterprise/index' },
    { icon: '📖', label: '名词解释', color: 'purple', page: '/pages/assistant/index' }
  ];

  const handleQuickAction = (action: { page: string; label: string }) => {
    console.log('[TodoPage] 点击快捷操作:', action.label);
    if (action.label === '名词解释') {
      Taro.showModal({
        title: '常见概念说明',
        content: '注册资本：现在是认缴制，建议填50-500万。\n经营范围：第一项影响税种认定。\n注册地址：商用房最稳妥。\n同名企业：高度相似可能被驳回。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    if (action.label === '邀请成员') {
      Taro.switchTab({ url: action.page });
      return;
    }
    Taro.switchTab({ url: action.page });
  };

  const tabOptions: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'urgent', label: '紧急' },
    { key: 'in_progress', label: '进行中' },
    { key: 'pending', label: '待开始' }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      {rejectCount > 0 && (
        <View className={styles.floatTips}>
          ⚠ 有{rejectCount}项内容需要修改
        </View>
      )}

      <View className={styles.greetingCard}>
        <View className={styles.avatar}>张</View>
        <View className={styles.greetingText}>
          <Text className={classnames(styles.greeting, isElderlyMode && 'elderly-zoom-subtitle')}>
            您好，张伟先生
          </Text>
          <Text className={styles.subGreeting}>
            正在办理「北京星辰科技有限公司」设立登记
          </Text>
        </View>
      </View>

      <ProgressCard
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        materialsDone={materialsDone}
        materialsTotal={materials.length}
      />

      <View className={styles.quickSection}>
        <View className={styles.sectionTitle}>
          <Text className={classnames(styles.titleText, isElderlyMode && 'elderly-zoom-text')}>
            常用功能
          </Text>
          {unreadCount > 0 && (
            <Text
              className={styles.moreBtn}
              onClick={() => Taro.switchTab({ url: '/pages/messages/index' })}
            >
              🔔 {unreadCount}条新消息 →
            </Text>
          )}
        </View>
        <View className={styles.quickGrid}>
          {quickActions.map((action, idx) => (
            <View
              key={idx}
              className={styles.quickItem}
              onClick={() => handleQuickAction(action)}
            >
              <View className={classnames(styles.quickIcon, styles[action.color])}>
                {action.icon}
              </View>
              <Text className={classnames(styles.quickLabel, isElderlyMode && 'elderly-zoom-small')}>
                {action.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.taskSection}>
        <View className={styles.taskHeader}>
          <Text className={classnames(styles.titleText, isElderlyMode && 'elderly-zoom-text')}>
            待办事项
          </Text>
          <View className={styles.tabBar}>
            {tabOptions.map(tab => (
              <Text
                key={tab.key}
                className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Text>
            ))}
          </View>
        </View>

        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.icon}>🎉</Text>
            <Text className={styles.text}>该分类暂无待办事项</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TodoPage;
