import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { questionGroups, conceptList } from '@/data/questions';
import classnames from 'classnames';

const AssistantPage: React.FC = () => {
  const { isElderlyMode, currentQuestionGroupIndex, setCurrentQuestionGroupIndex, answers, setAnswer, hydrateFromStorage } = useAppStore();
  const [showSaveTip, setShowSaveTip] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const handleSelectOption = (questionId: string, option: string, isMulti: boolean) => {
    if (isMulti) {
      const current = (answers[questionId] as string[]) || [];
      const idx = current.indexOf(option);
      if (idx > -1) {
        setAnswer(questionId, current.filter(o => o !== option));
      } else {
        setAnswer(questionId, [...current, option]);
      }
    } else {
      setAnswer(questionId, option);
    }
  };

  const handleConceptClick = (conceptKey: string) => {
    const concept = conceptList.find(c => c.key === conceptKey);
    if (concept) {
      Taro.showModal({
        title: concept.title,
        content: concept.content,
        showCancel: false,
        confirmText: '明白了'
      });
    }
  };

  const isQuestionAnswered = (qid: string): boolean => {
    const ans = answers[qid];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return typeof ans === 'string' && ans.trim().length > 0;
  };

  const findFirstMissingRequired = (): { groupIndex: number; questionId: string; questionText: string; groupTitle: string } | null => {
    for (let g = 0; g < questionGroups.length; g++) {
      const group = questionGroups[g];
      for (const q of group.questions) {
        if (q.required && !isQuestionAnswered(q.id)) {
          return {
            groupIndex: g,
            questionId: q.id,
            questionText: q.question,
            groupTitle: group.title
          };
        }
      }
    }
    return null;
  };

  const handleSaveDraft = () => {
    console.log('[AssistantPage] 保存草稿');
    setShowSaveTip(true);
    setTimeout(() => setShowSaveTip(false), 2000);
    Taro.showToast({ title: '草稿已保存至本地', icon: 'success' });
  };

  const handleNextGroup = () => {
    const currentGroup = questionGroups[currentQuestionGroupIndex];
    for (const q of currentGroup.questions) {
      if (q.required && !isQuestionAnswered(q.id)) {
        Taro.showToast({ title: `请填写：${q.question.replace(/[?？]$/, '')}`, icon: 'none', duration: 2500 });
        return;
      }
    }

    if (currentQuestionGroupIndex < questionGroups.length - 1) {
      setCurrentQuestionGroupIndex(currentQuestionGroupIndex + 1);
      Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
    } else {
      const missing = findFirstMissingRequired();
      if (missing) {
        Taro.showModal({
          title: '请先完成以下内容',
          content: `【${missing.groupTitle}】\n${missing.questionText}`,
          confirmText: '去填写',
          cancelText: '知道了',
          confirmColor: '#1677ff',
          success: (res) => {
            if (res.confirm) {
              setCurrentQuestionGroupIndex(missing.groupIndex);
              Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
            }
          }
        });
        return;
      }

      Taro.showModal({
        title: '确认提交申报信息？',
        content: '您已完成所有信息填写，提交后将进入审核阶段。如有需要修改的内容，请返回调整。',
        confirmText: '确认提交',
        cancelText: '再看看',
        success: (res) => {
          if (res.confirm) {
            Taro.showLoading({ title: '提交中...' });
            setTimeout(() => {
              Taro.hideLoading();
              Taro.showToast({ title: '已提交审核', icon: 'success' });
              Taro.switchTab({ url: '/pages/messages/index' });
            }, 1200);
          }
        }
      });
    }
  };

  const handlePrevGroup = () => {
    if (currentQuestionGroupIndex > 0) {
      setCurrentQuestionGroupIndex(currentQuestionGroupIndex - 1);
      Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
    }
  };

  const handleShowSummary = () => {
    const summaryItems: { label: string; value: string }[] = [];
    questionGroups.forEach(group => {
      group.questions.forEach(q => {
        const ans = answers[q.id];
        if (ans) {
          const val = Array.isArray(ans) ? ans.join('、') : ans;
          summaryItems.push({ label: q.question.replace(/[?？]$/, ''), value: val });
        }
      });
    });

    const content = summaryItems.map(s => `【${s.label}】\n${s.value}`).join('\n\n');
    Taro.showModal({
      title: '申报摘要确认',
      content: content.slice(0, 500) + (content.length > 500 ? '\n...（内容较多，完整内容可在提交前查看）' : ''),
      showCancel: true,
      confirmText: '信息无误',
      cancelText: '去修改',
      confirmColor: '#1677ff',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已确认', icon: 'success' });
        }
      }
    });
  };

  const currentGroup = questionGroups[currentQuestionGroupIndex];
  const isFirstGroup = currentQuestionGroupIndex === 0;
  const isLastGroup = currentQuestionGroupIndex === questionGroups.length - 1;

  return (
    <ScrollView className={styles.page} scrollY>
      {showSaveTip && <View className={styles.saveTip}>✓ 已自动保存至草稿</View>}

      {questionGroups.map((group, gIndex) => {
        const groupStatus = gIndex < currentQuestionGroupIndex ? 'completed'
          : gIndex === currentQuestionGroupIndex ? 'active' : 'pending';
        const isActive = groupStatus === 'active';
        return (
          <View
            key={group.id}
            className={classnames(
              styles.groupCard,
              styles[groupStatus],
              isActive && styles.active
            )}
            onClick={() => {
              if (gIndex <= currentQuestionGroupIndex) {
                setCurrentQuestionGroupIndex(gIndex);
              }
            }}
          >
            <View className={styles.groupHeader}>
              <View className={styles.groupLeft}>
                <View className={styles.groupNumber}>
                  {groupStatus === 'completed' ? '✓' : gIndex + 1}
                </View>
                <Text className={classnames(styles.groupTitle, isElderlyMode && 'elderly-zoom-subtitle')}>
                  {group.title}
                </Text>
              </View>
              <View className={styles.progressBadge}>
                {groupStatus === 'completed' ? '已完成' : `${group.progress}%`}
              </View>
            </View>
            <Text className={classnames(groupStatus === 'pending' && styles.groupDesc, isElderlyMode && 'elderly-zoom-small')}>
              {group.description}
            </Text>

            {!isActive && (
              <View className={styles.progressBarWrap}>
                <View className={styles.progressBar}>
                  <View className={styles.progressFill} style={{ width: `${group.progress}%` }} />
                </View>
              </View>
            )}

            {isActive && group.questions.map(q => {
              const currentAns = answers[q.id];
              return (
                <View key={q.id} className={styles.questionCard}>
                  <Text className={classnames(styles.questionText, isElderlyMode && 'elderly-zoom-text')}>
                    {q.required && <Text className={styles.requiredFlag}>*</Text>}
                    {q.question}
                  </Text>
                  {q.helpText && (
                    <Text className={classnames(styles.helpText, isElderlyMode && 'elderly-zoom-small')}>
                      💡 {q.helpText}
                    </Text>
                  )}
                  {q.concept && (
                    <View className={styles.conceptLink} onClick={() => handleConceptClick(q.concept!)}>
                      查看相关概念说明
                    </View>
                  )}

                  {(q.type === 'text' || q.type === 'date') && (
                    <View className={styles.inputWrap}>
                      <Input
                        className={styles.inputField}
                        placeholder={q.placeholder}
                        value={(currentAns as string) || ''}
                        onInput={(e) => setAnswer(q.id, e.detail.value)}
                      />
                    </View>
                  )}

                  {(q.type === 'select' || q.type === 'picker') && (
                    <View className={styles.optionsList}>
                      {q.options?.map(option => (
                        <View
                          key={option}
                          className={classnames(
                            styles.optionItem,
                            currentAns === option && styles.selected,
                            isElderlyMode && 'elderly-zoom-text'
                          )}
                          onClick={() => handleSelectOption(q.id, option, false)}
                        >
                          {currentAns === option && '✓ '}{option}
                        </View>
                      ))}
                    </View>
                  )}

                  {q.type === 'multi' && (
                    <View className={styles.optionsList}>
                      {q.options?.map(option => {
                        const selected = (currentAns as string[] || []).includes(option);
                        return (
                          <View
                            key={option}
                            className={classnames(
                              styles.optionItem,
                              selected && styles.selected,
                              isElderlyMode && 'elderly-zoom-text'
                            )}
                            onClick={() => handleSelectOption(q.id, option, true)}
                          >
                            {selected ? '☑ ' : '☐ '}{option}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      <View className={styles.saveTip} onClick={handleShowSummary} style={{ cursor: 'pointer' }}>
        📋 查看已填写的申报摘要
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.btnSecondary}
          disabled={isFirstGroup}
          onClick={handlePrevGroup}
        >
          上一步
        </Button>
        <Button className={styles.btnSecondary} onClick={handleSaveDraft}>
          存草稿
        </Button>
        <Button className={styles.btnPrimary} onClick={handleNextGroup}>
          {isLastGroup ? '提交申报' : '下一步'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default AssistantPage;
