import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import classnames from 'classnames';

interface ProgressCardProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  materialsDone: number;
  materialsTotal: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  totalTasks,
  completedTasks,
  pendingTasks,
  materialsDone,
  materialsTotal
}) => {
  const { isElderlyMode } = useAppStore();
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={classnames(styles.title, isElderlyMode && 'elderly-zoom-subtitle')}>
          整体办理进度
        </Text>
        <Text className={styles.subtitle}>碎片时间推进一下</Text>
      </View>
      <View className={styles.progressRow}>
        <Text className={classnames(styles.progressValue, isElderlyMode && 'elderly-zoom-title')}>
          {overallProgress}%
        </Text>
        <View className={styles.progressCircle}>
          <View className={styles.progressFill} style={{ width: `${overallProgress}%` }} />
        </View>
      </View>
      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, isElderlyMode && 'elderly-zoom-subtitle')}>
            {totalTasks}
          </Text>
          <Text className={styles.statLabel}>总事项</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, isElderlyMode && 'elderly-zoom-subtitle')}>
            {pendingTasks}
          </Text>
          <Text className={styles.statLabel}>待处理</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, isElderlyMode && 'elderly-zoom-subtitle')}>
            {materialsDone}/{materialsTotal}
          </Text>
          <Text className={styles.statLabel}>材料</Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressCard;
