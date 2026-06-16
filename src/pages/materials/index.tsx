import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import MaterialItem from '@/components/MaterialItem';
import { useAppStore } from '@/store/useAppStore';
import { DisplayCondition } from '@/types';
import classnames from 'classnames';

type CategoryType = 'all' | 'identity' | 'site' | 'auth' | 'other';

const evaluateCondition = (cond: DisplayCondition, answers: Record<string, string | string[]>): boolean => {
  const ans = answers[cond.questionId];

  if (cond.textNotEmpty) {
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return typeof ans === 'string' && ans.trim().length > 0;
  }

  const ansText: string = Array.isArray(ans) ? ans.join('、') : (ans || '');
  const ansArray: string[] = Array.isArray(ans) ? ans : (ans ? [ans] : []);

  if (cond.anyOf) {
    const match = cond.anyOf.some(opt => ansArray.includes(opt) || ansText.includes(opt));
    if (!match) return false;
  }

  if (cond.noneOf) {
    const conflict = cond.noneOf.some(opt => ansArray.includes(opt) || ansText.includes(opt));
    if (conflict) return false;
  }

  return true;
};

const checkMaterialDisplay = (
  material,
  answers: Record<string, string | string[]>
): boolean => {
  if (!material.conditions || material.conditions.length === 0) return true;
  return material.conditions.every(cond => evaluateCondition(cond, answers));
};

const getShareholderCount = (answers: Record<string, string | string[]>): number => {
  const q7 = answers['q7'] as string;
  const q3 = answers['q3'] as string;
  if (q3?.includes('独资') || q7 === '仅1人（独资）') return 1;
  if (q7 === '2人') return 2;
  if (q7 === '3-5人') return 4;
  if (q7 === '5人以上') return 6;
  return 1;
};

const expandDynamicMaterials = (materials, answers) => {
  const result = [];
  materials.forEach(m => {
    if (checkMaterialDisplay(m, answers)) {
      if (m.dynamicSuffix === '_shareholder_count') {
        const count = getShareholderCount(answers);
        for (let i = 1; i <= count; i++) {
          result.push({
            ...m,
            id: `${m.id}_${i}`,
            name: `${m.name}（股东${count > 1 ? i : ''}）`.replace('（股东）', ''),
            dynamicSuffix: undefined,
            conditions: undefined
          });
        }
      } else {
        result.push(m);
      }
    }
  });
  return result;
};

const MaterialsPage: React.FC = () => {
  const { isElderlyMode, materials, hydrateFromStorage, answers } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');

  React.useEffect(() => {
    hydrateFromStorage();
  }, []);

  const displayedMaterials = useMemo(() => {
    return expandDynamicMaterials(materials, answers);
  }, [materials, answers]);

  const stats = useMemo(() => {
    return {
      verified: displayedMaterials.filter(m => m.status === 'verified').length,
      uploaded: displayedMaterials.filter(m => m.status === 'uploaded' || m.status === 'need_sign').length,
      needSign: displayedMaterials.filter(m => m.status === 'need_sign' || (m.needSign && !m.signed && m.status === 'uploaded')).length,
      pending: displayedMaterials.filter(m => m.status === 'not_uploaded').length,
      rejected: displayedMaterials.filter(m => m.status === 'rejected').length,
      total: displayedMaterials.length
    };
  }, [displayedMaterials]);

  const categories: { key: CategoryType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'identity', label: '身份证明' },
    { key: 'site', label: '场地材料' },
    { key: 'auth', label: '授权文书' },
    { key: 'other', label: '社保/发票' }
  ];

  const filteredMaterials = useMemo(() => {
    if (activeCategory === 'all') return displayedMaterials;
    return displayedMaterials.filter(m => m.category === activeCategory);
  }, [activeCategory, displayedMaterials]);

  const needSignList = useMemo(() =>
    displayedMaterials.filter(m => m.needSign && !m.signed && m.status !== 'verified'),
  [displayedMaterials]);

  const handleBatchUpload = () => {
    console.log('[MaterialsPage] 批量上传');
    Taro.chooseImage({
      count: 20,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[MaterialsPage] 批量选择成功:', res.tempFilePaths.length);
        Taro.showToast({
          title: `已选择${res.tempFilePaths.length}张图片，请分配对应材料`,
          icon: 'none',
          duration: 2000
        });
      }
    });
  };

  const handleCheckAll = () => {
    console.log('[MaterialsPage] 查看签字指引');
    Taro.showModal({
      title: '签字盖章指引',
      content: '1. 身份证复印件：每一页由持有人在右下角签字\n2. 租赁合同：出租方和承租方均需在最后一页签字盖章\n3. 公司章程：全体股东签字（自然人签字/法人盖公章）\n4. 股东会决议：全体股东签字\n5. 授权书：由法定代表人签字并加盖公章',
      showCancel: false,
      confirmText: '我知道了'
    });
  };

  const handleSubmitAll = () => {
    console.log('[MaterialsPage] 提交所有材料');
    const readyCount = stats.verified + stats.uploaded;
    const notReadyCount = stats.pending + stats.needSign;
    if (notReadyCount > 0) {
      Taro.showModal({
        title: '有材料尚未准备好',
        content: `已完成 ${readyCount} / ${stats.total} 项材料。\n待签字盖章：${stats.needSign} 项\n待上传：${stats.pending} 项\n\n是否先提交已完成的材料进入审核？`,
        confirmText: '先提交已完成的',
        cancelText: '再等等',
        success: (res) => {
          if (res.confirm) {
            Taro.showLoading({ title: '提交中...' });
            setTimeout(() => {
              Taro.hideLoading();
              Taro.showToast({ title: '已提交审核', icon: 'success' });
              Taro.switchTab({ url: '/pages/messages/index' });
            }, 1000);
          }
        }
      });
    } else {
      Taro.showLoading({ title: '提交中...' });
      setTimeout(() => {
        Taro.hideLoading();
        Taro.showToast({ title: '材料已提交', icon: 'success' });
      }, 1000);
    }
  };

  const handleShowTemplate = () => {
    Taro.showActionSheet({
      itemList: ['租赁合同模板', '公司章程模板', '股东会决议模板', '授权委托书模板'],
      success: (res) => {
        console.log('[MaterialsPage] 选择模板:', res.tapIndex);
        Taro.showToast({ title: '模板下载中...', icon: 'loading' });
      }
    });
  };

  const handleRefreshHint = () => {
    Taro.showToast({ title: '材料清单已根据填报内容自动更新', icon: 'none' });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.statCard}>
        <Text className={classnames(styles.statTitle, isElderlyMode && 'elderly-zoom-subtitle')}>
          材料概览 · 共 {stats.total} 项
          <Text className={styles.refreshHint} onClick={handleRefreshHint}>
            {' '}🔄 智能匹配
          </Text>
        </Text>
        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.verified)}>{stats.verified}</Text>
            <Text className={styles.statLabel}>已核验</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.uploaded)}>{stats.uploaded}</Text>
            <Text className={styles.statLabel}>已上传</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.needSign)}>{stats.needSign}</Text>
            <Text className={styles.statLabel}>待签字</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.pending)}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待上传</Text>
          </View>
        </View>
      </View>

      {needSignList.length > 0 && (
        <View className={styles.signTipCard}>
          <Text className={styles.signTipIcon}>✍️</Text>
          <View className={styles.signTipContent}>
            <Text className={classnames(styles.signTipTitle, isElderlyMode && 'elderly-zoom-text')}>
              有 {needSignList.length} 项材料需要签字盖章
            </Text>
            <Text className={classnames(styles.signTipText, isElderlyMode && 'elderly-zoom-small')}>
              请在纸质材料上签字后重新拍照上传，点击查看签字位置指引
            </Text>
          </View>
        </View>
      )}

      <ScrollView className={styles.categoryFilter} scrollX showScrollbar={false}>
        {categories.map(cat => {
          const count = cat.key === 'all'
            ? stats.total
            : displayedMaterials.filter(m => m.category === cat.key).length;
          return (
            <View
              key={cat.key}
              className={classnames(styles.categoryChip, activeCategory === cat.key && styles.active)}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              <Text className={activeCategory === cat.key ? styles.countBadge : ''}>
                {count}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.sectionHeader}>
        <Text className={classnames(styles.sectionTitle, isElderlyMode && 'elderly-zoom-text')}>
          材料清单
        </Text>
        <Text className={styles.sectionAction} onClick={handleShowTemplate}>
          📄 下载模板
        </Text>
      </View>

      {filteredMaterials.length > 0 ? (
        filteredMaterials.map(material => (
          <MaterialItem key={material.id} material={material} />
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.icon}>📁</Text>
          <Text className={styles.title}>该分类暂无材料</Text>
          <Text className={styles.text}>根据填报内容自动匹配，或切换分类查看</Text>
        </View>
      )}

      <View className={styles.uploadFab} onClick={handleBatchUpload}>
        <Text className={styles.uploadFabIcon}>📷</Text>
        <Text className={styles.uploadFabText}>拍照</Text>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.btnOutline} onClick={handleCheckAll}>
          签字指引
        </Button>
        <Button className={styles.btnPrimary} onClick={handleSubmitAll}>
          提交材料审核
        </Button>
      </View>
    </ScrollView>
  );
};

export default MaterialsPage;
