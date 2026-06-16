import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { MessageItem as MessageItemType } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import classnames from 'classnames';

interface MessageItemProps {
  message: MessageItemType;
}

const typeIconMap: Record<string, string> = {
  progress: '📋',
  notification: '📢',
  reminder: '⏰',
  reject: '⚠️'
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { isElderlyMode, markMessageRead } = useAppStore();

  const handleContainerClick = () => {
    if (!message.read) {
      markMessageRead(message.id);
    }
  };

  const handleAction = () => {
    console.log('[MessageItem] 消息操作:', message.id, message.actionText);
    if (!message.read) {
      markMessageRead(message.id);
    }
    if (message.actionPage) {
      Taro.switchTab({ url: message.actionPage });
    }
  };

  return (
    <View className={classnames(styles.container, !message.read && styles.unread)} onClick={handleContainerClick}>
      <View className={styles.header}>
        <View className={classnames(styles.typeIcon, styles[`${message.type}Type`])}>
          {typeIconMap[message.type]}
        </View>
        <View className={styles.headerText}>
          <Text className={styles.typeName}>{message.typeName}</Text>
          <Text className={classnames(styles.title, isElderlyMode && 'elderly-zoom-text')}>
            {message.title}
          </Text>
        </View>
      </View>
      <Text className={classnames(styles.content, isElderlyMode && 'elderly-zoom-small')}>
        {message.content}
      </Text>
      <View className={styles.bottomRow}>
        <Text className={styles.time}>{message.time}</Text>
        {message.actionText && (
          <Button
            className={classnames(
              styles.actionBtn,
              message.type === 'reject' && styles.danger
            )}
            onClick={handleAction}
          >
            {message.actionText}
          </Button>
        )}
      </View>
    </View>
  );
};

export default MessageItem;
