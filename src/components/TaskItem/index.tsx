import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { TaskItem as TaskItemType } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { categoryNames } from '@/data/tasks';
import classnames from 'classnames';

interface TaskItemProps {
  task: TaskItemType;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { isElderlyMode, setCurrentTaskGuide } = useAppStore();

  const statusText: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    rejected: '需修改'
  };

  const actionText: Record<string, string> = {
    pending: '去开始',
    in_progress: '继续',
    completed: '查看',
    rejected: '去修改'
  };

  const handleAction = () => {
    console.log('[TaskItem] 点击任务:', task.id, task.title);
    setCurrentTaskGuide(task);
    if (task.category === 'license') {
      Taro.navigateTo({ url: '/pages/task-guide/index' });
    } else {
      Taro.navigateTo({ url: '/pages/task-guide/index' });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.leftPart}>
          <View className={classnames(styles.categoryTag, styles[task.category])}>
            {categoryNames[task.category]}
          </View>
          <Text className={classnames(styles.title, isElderlyMode && 'elderly-zoom-text')}>
            {task.title}
          </Text>
        </View>
        <View className={classnames(styles.statusTag, styles[task.status])}>
          {statusText[task.status]}
        </View>
      </View>
      <Text className={classnames(styles.description, isElderlyMode && 'elderly-zoom-small')}>
        {task.description}
      </Text>
      <View className={styles.bottomRow}>
        {task.status === 'completed' ? (
          <View className={styles.completedBadge}>
            <Text className={styles.completedIcon}>✓</Text>
            <Text className={styles.completedText}>已完成</Text>
          </View>
        ) : (
          <View className={styles.progressWrap}>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${task.progress}%` }} />
            </View>
            <Text className={styles.progressText}>{task.progress}%</Text>
          </View>
        )}
        {task.status !== 'completed' && task.deadline && <Text className={styles.deadline}>截止 {task.deadline}</Text>}
        <Button className={styles.actionBtn} onClick={handleAction}>
          {actionText[task.status]}
        </Button>
      </View>
    </View>
  );
};

export default TaskItem;
