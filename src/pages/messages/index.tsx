import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import { useAppStore } from '@/store/useAppStore';
import { messageList, timelineList, reminderList } from '@/data/messages';
import classnames from 'classnames';

type TabType = 'all' | 'progress' | 'reminder' | 'reject';

const MessagesPage: React.FC = () => {
  const { isElderlyMode } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [reminders, setReminders] = useState(reminderList);

  const unreadByType = useMemo(() => ({
    all: messageList.filter(m => !m.read).length,
    progress: messageList.filter(m => m.type === 'progress' && !m.read).length,
    reminder: messageList.filter(m => m.type === 'reminder' && !m.read).length,
    reject: messageList.filter(m => m.type === 'reject' && !m.read).length
  }), []);

  const tabOptions: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'progress', label: '办理进度' },
    { key: 'reminder', label: '开业提醒' },
    { key: 'reject', label: '退回补正' }
  ];

  const filteredMessages = useMemo(() => {
    if (activeTab === 'all') return messageList;
    return messageList.filter(m => m.type === activeTab);
  }, [activeTab]);

  const overallProgress = useMemo(() => {
    const done = timelineList.filter(t => t.status === 'done').length;
    return `${done}/${timelineList.length}`;
  }, []);

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    ));
  };

  const handleMarkAllRead = () => {
    console.log('[MessagesPage] 全部标为已读');
    Taro.showToast({ title: '已全部标记', icon: 'success' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabBar}>
        {tabOptions.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(isElderlyMode && 'elderly-zoom-small')}>
              {tab.label}
            </Text>
            {unreadByType[tab.key] > 0 && (
              <View className={styles.unreadBadge}>{unreadByType[tab.key]}</View>
            )}
          </View>
        ))}
      </View>

      {activeTab === 'all' || activeTab === 'progress' ? (
        <View className={styles.timelineCard}>
          <View className={styles.cardHeader}>
            <Text className={classnames(styles.cardTitle, isElderlyMode && 'elderly-zoom-text')}>
              办理进度时间线
            </Text>
            <Text className={styles.overallProgress}>已完成 {overallProgress}</Text>
          </View>
          <View className={styles.timeline}>
            <View className={styles.timelineLine} />
            {timelineList.map(item => (
              <View
                key={item.id}
                className={classnames(styles.timelineItem, styles[item.status])}
              >
                <View className={styles.timelineDot} />
                <View className={styles.timelineContent}>
                  <Text className={classnames(styles.timelineTitle, isElderlyMode && 'elderly-zoom-text')}>
                    {item.title}
                  </Text>
                  <Text className={styles.timelineTime}>{item.time}</Text>
                  {item.description && (
                    <Text className={classnames(styles.timelineDesc, isElderlyMode && 'elderly-zoom-small')}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {(activeTab === 'all' || activeTab === 'reminder') && reminders.length > 0 ? (
        <View className={styles.reminderCard}>
          <View className={styles.cardHeader} style={{ marginBottom: 0 }}>
            <Text className={classnames(styles.cardTitle, isElderlyMode && 'elderly-zoom-text')}>
              📅 开业前待办提醒
            </Text>
          </View>
          {reminders.map(reminder => (
            <View key={reminder.id} className={styles.reminderItem}>
              <View className={classnames(styles.reminderIcon, styles[reminder.type])}>
                {reminder.type === 'seal' && '🔐'}
                {reminder.type === 'tax' && '📊'}
                {reminder.type === 'bank' && '🏦'}
                {reminder.type === 'social' && '👥'}
              </View>
              <View className={styles.reminderBody}>
                <View className={styles.reminderHeader}>
                  <Text className={classnames(styles.reminderTitle, isElderlyMode && 'elderly-zoom-text')}>
                    {reminder.title}
                  </Text>
                  <Text className={styles.reminderDate}>{reminder.date}前</Text>
                </View>
                <Text className={classnames(styles.reminderDesc, isElderlyMode && 'elderly-zoom-small')}>
                  {reminder.description}
                </Text>
              </View>
              <View
                className={classnames(styles.reminderCheck, reminder.done && styles.checked)}
                onClick={() => handleToggleReminder(reminder.id)}
              >
                {reminder.done && '✓'}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View className={styles.sectionHeader}>
        <Text className={classnames(styles.sectionTitle, isElderlyMode && 'elderly-zoom-text')}>
          消息列表
        </Text>
        <Text className={styles.markAllRead} onClick={handleMarkAllRead}>
          全部标为已读
        </Text>
      </View>

      {filteredMessages.length > 0 ? (
        filteredMessages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.icon}>📭</Text>
          <Text className={styles.title}>暂无相关消息</Text>
          <Text className={styles.text}>有新的进度或通知会第一时间推送给您</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MessagesPage;
