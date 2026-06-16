import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface Step {
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface StepIndicatorProps {
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  return (
    <View className={styles.container}>
      {steps.map((step, index) => (
        <View
          key={index}
          className={classnames(styles.stepItem, styles[step.status])}
        >
          <View className={styles.stepCircle}>
            {step.status === 'done' ? '✓' : index + 1}
          </View>
          <Text className={styles.stepLabel}>{step.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default StepIndicator;
