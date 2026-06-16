import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { MaterialItem as MaterialItemType } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import classnames from 'classnames';
import { categoryColors } from '@/data/materials';

interface MaterialItemProps {
  material: MaterialItemType;
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material }) => {
  const { isElderlyMode } = useAppStore();

  const statusText: Record<string, string> = {
    not_uploaded: '待上传',
    uploaded: '已上传',
    need_sign: '待签字',
    verified: '核验通过',
    rejected: '被退回'
  };

  const handleUpload = () => {
    console.log('[MaterialItem] 上传材料:', material.id, material.name);
    Taro.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[MaterialItem] 选择图片成功:', res.tempFilePaths.length, '张');
        Taro.showToast({ title: `已选择${res.tempFilePaths.length}张图片`, icon: 'success' });
      },
      fail: (err) => {
        console.error('[MaterialItem] 选择图片失败:', err);
      }
    });
  };

  const handleFix = () => {
    console.log('[MaterialItem] 修改材料:', material.id);
    Taro.showToast({ title: '进入修改页面', icon: 'none' });
  };

  const handleSign = () => {
    console.log('[MaterialItem] 签字确认:', material.id);
    Taro.showToast({ title: '请在纸质文件上签字后重新拍照上传', icon: 'none', duration: 2000 });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.leftPart}>
          <View
            className={styles.categoryTag}
            style={{ background: categoryColors[material.category] }}
          >
            {material.categoryName}
          </View>
          <Text className={classnames(styles.name, isElderlyMode && 'elderly-zoom-text')}>
            {material.name}
          </Text>
        </View>
        <View className={classnames(styles.statusTag, styles[material.status])}>
          {statusText[material.status]}
        </View>
      </View>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>共 {material.pages} 页</View>
        {material.uploadTime && (
          <View className={styles.metaItem}>上传于 {material.uploadTime}</View>
        )}
        {material.needSign && (
          <View
            className={classnames(styles.signBadge, material.signed && styles.signed)}
          >
            {material.signed ? '✓ 已签字' : '⚠ 需签字盖章'}
          </View>
        )}
      </View>

      {material.rejectReason && (
        <View className={styles.rejectReason}>
          <Text className={styles.rejectTitle}>退回原因说明</Text>
          <Text className={styles.rejectText}>{material.rejectReason}</Text>
        </View>
      )}

      <View className={styles.actionRow}>
        {material.status === 'not_uploaded' && (
          <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleUpload}>
            📷 拍照上传
          </Button>
        )}
        {material.status === 'rejected' && (
          <>
            <Button className={classnames(styles.actionBtn, styles.outline)} onClick={handleFix}>
              查看示例
            </Button>
            <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleFix}>
              重新上传
            </Button>
          </>
        )}
        {material.status === 'need_sign' && (
          <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleSign}>
            ✍ 签字指引
          </Button>
        )}
        {(material.status === 'uploaded' || material.status === 'verified') && (
          <>
            <Button className={classnames(styles.actionBtn, styles.outline)} onClick={handleFix}>
              预览
            </Button>
            {material.status === 'uploaded' && (
              <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleUpload}>
                补充/替换
              </Button>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default MaterialItem;
