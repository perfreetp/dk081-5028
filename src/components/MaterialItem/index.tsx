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
  const { isElderlyMode, updateMaterialStatus } = useAppStore();

  const statusText: Record<string, string> = {
    not_uploaded: '待上传',
    uploaded: '已上传',
    need_sign: '待签字',
    verified: '核验通过',
    rejected: '被退回'
  };

  const doUpload = (onComplete?: () => void) => {
    Taro.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[MaterialItem] 选择图片成功:', res.tempFilePaths.length, '张');
        Taro.showLoading({ title: '上传中...' });
        setTimeout(() => {
          Taro.hideLoading();
          const newStatus = material.needSign ? 'need_sign' : 'uploaded';
          updateMaterialStatus(material.id, newStatus);
          Taro.showToast({ title: '上传成功', icon: 'success' });
          if (onComplete) onComplete();
        }, 800);
      },
      fail: (err) => {
        console.error('[MaterialItem] 选择图片失败:', err);
      }
    });
  };

  const handleUpload = () => {
    console.log('[MaterialItem] 上传材料:', material.id, material.name);
    doUpload();
  };

  const handleReupload = () => {
    console.log('[MaterialItem] 重新上传被退回材料:', material.id);
    doUpload(() => {
      Taro.showToast({ title: '已重新提交审核', icon: 'success' });
    });
  };

  const handleFix = () => {
    console.log('[MaterialItem] 查看示例/预览:', material.id);
    Taro.showToast({ title: '进入预览', icon: 'none' });
  };

  const handleSign = () => {
    console.log('[MaterialItem] 签字确认:', material.id);
    Taro.showModal({
      title: '签字指引',
      content: '请按照以下步骤操作：\n1. 打印纸质文件\n2. 法定代表人在指定位置签字并加盖公章\n3. 拍照后重新上传',
      confirmText: '去拍照',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          Taro.chooseImage({
            count: 9,
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success: (res) => {
              Taro.showLoading({ title: '上传中...' });
              setTimeout(() => {
                Taro.hideLoading();
                updateMaterialStatus(material.id, 'uploaded', true);
                Taro.showToast({ title: '已完成签字上传', icon: 'success' });
              }, 800);
            }
          });
        }
      }
    });
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
            <Button className={classnames(styles.actionBtn, styles.primary)} onClick={handleReupload}>
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
