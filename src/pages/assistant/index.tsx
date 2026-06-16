import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { questionGroups, conceptList } from '@/data/questions';
import classnames from 'classnames';

interface MissingItem {
  groupIndex: number;
  groupTitle: string;
  questionId: string;
  questionText: string;
}

interface MaterialBrief {
  id: string;
  name: string;
  done: boolean;
}

interface RiskItem {
  title: string;
  content: string;
}

const AssistantPage: React.FC = () => {
  const {
    isElderlyMode,
    currentQuestionGroupIndex,
    setCurrentQuestionGroupIndex,
    answers,
    setAnswer,
    materials,
    hydrateFromStorage,
    syncDynamicMaterials
  } = useAppStore();

  const [showSaveTip, setShowSaveTip] = useState(false);
  const [showPrecheck, setShowPrecheck] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useEffect(() => {
    syncDynamicMaterials(answers);
  }, [answers, syncDynamicMaterials]);

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

  const getAnswerText = (qid: string): string => {
    const ans = answers[qid];
    if (!ans) return '';
    if (Array.isArray(ans)) return ans.join('、');
    return ans;
  };

  const findFirstMissingRequired = (): MissingItem | null => {
    for (let g = 0; g < questionGroups.length; g++) {
      const group = questionGroups[g];
      for (const q of group.questions) {
        if (q.required && !isQuestionAnswered(q.id)) {
          return {
            groupIndex: g,
            groupTitle: group.title,
            questionId: q.id,
            questionText: q.question
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
      setShowPrecheck(true);
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

  // ============ 预审清单计算 ============
  const precheckData = useMemo(() => {
    // 1. 分组进度
    const groupProgress = questionGroups.map(group => {
      const requiredQs = group.questions.filter(q => q.required);
      const done = requiredQs.filter(q => isQuestionAnswered(q.id)).length;
      const total = requiredQs.length || 1;
      const pct = Math.round((done / total) * 100);
      return {
        id: group.id,
        title: group.title,
        done,
        total,
        pct,
        status: pct === 100 ? 'done' : pct > 0 ? 'partial' : 'empty'
      };
    });

    // 总进度
    const totalRequired = questionGroups.reduce((s, g) => s + g.questions.filter(q => q.required).length, 0);
    const totalDone = questionGroups.reduce((s, g) => s + g.questions.filter(q => q.required && isQuestionAnswered(q.id)).length, 0);
    const overallPct = Math.round((totalDone / (totalRequired || 1)) * 100);

    // 2. 缺失项
    const missingList: MissingItem[] = [];
    questionGroups.forEach((group, gIdx) => {
      group.questions.forEach(q => {
        if (q.required && !isQuestionAnswered(q.id)) {
          missingList.push({
            groupIndex: gIdx,
            groupTitle: group.title,
            questionId: q.id,
            questionText: q.question
          });
        }
      });
    });

    // 3. 材料概览
    const materialBriefs: MaterialBrief[] = materials.map(m => ({
      id: m.id,
      name: m.name,
      done: m.status === 'uploaded' || m.status === 'verified' || m.status === 'need_sign'
    }));
    const materialsDoneCount = materialBriefs.filter(m => m.done).length;

    // 4. 风险提醒（仅针对已填写内容校验，缺失项在缺失区提示
    const risks: RiskItem[] = [];

    // 注册资本风险（仅当已填写时校验）
    const capitalText = getAnswerText('q4');
    if (capitalText && capitalText.trim()) {
      const num = parseFloat(capitalText.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) {
        if (num < 10) {
          risks.push({
            title: `注册资本 ${num} 万元偏低`,
            content: '建议小微企业注册资本填写 50-500 万，过低可能影响客户信任和投标资格。'
          });
        } else if (num > 5000) {
          risks.push({
            title: `注册资本 ${num} 万元偏高`,
            content: '注册资本过高会增加印花税（按万分之2.5缴纳），且认缴需承担对应法律责任，请根据实际业务需求填写。'
          });
        }
      }
    }

    // 法人身份证风险（仅当已填写时校验）
    const legalIdCard = getAnswerText('q9');
    if (legalIdCard && legalIdCard.trim()) {
      const digits = legalIdCard.replace(/\D/g, '');
      if (digits.length !== 18) {
        risks.push({
          title: `身份证号位数不对（${digits.length}位）`,
          content: `居民身份证号应为18位数字（含X），当前只输入了${digits.length}位，请核对。`
        });
      }
      if (/^\d{17}[\dXx]$/.test(digits) === false && digits.length === 18) {
        // 格式校验可按需开启
      }
    }

    // 材料退回风险
    const rejectedCount = materials.filter(m => m.status === 'rejected').length;
    if (rejectedCount > 0) {
      risks.push({
        title: `有 ${rejectedCount} 份材料被退回`,
        content: '被退回的材料需要按照要求修改后重新上传，否则会影响办理进度。'
      });
    }

    // 待签字风险
    const needSignCount = materials.filter(m => (m.status === 'need_sign' || (m.needSign && !m.signed && m.status === 'uploaded'))).length;
    if (needSignCount > 0) {
      risks.push({
        title: `有 ${needSignCount} 份材料需要签字盖章`,
        content: '未签字盖章的材料无法通过审核，请按指引完成签字后重新拍照上传。'
      });
    }

    // 多个股东时的风险提示
    const shareholderCount = getAnswerText('q7');
    const companyType = getAnswerText('q3');
    if (companyType?.includes('有限责任') && shareholderCount === '仅1人（独资）') {
      risks.push({
        title: '自然人独资企业提示',
        content: '一人有限责任公司每年需审计且股东需证明个人财产独立于公司财产，建议考虑增加少量股份给家人。'
      });
    }

    return {
      groupProgress,
      overallPct,
      totalRequired,
      totalDone,
      missingList,
      materialBriefs,
      materialsDoneCount,
      risks
    };
  }, [answers, materials]);

  const canSubmit = precheckData.missingList.length === 0;

  const handleJumpToGroup = (groupIndex: number) => {
    setShowPrecheck(false);
    setCurrentQuestionGroupIndex(groupIndex);
    setTimeout(() => {
      Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
    }, 300);
  };

  const handleJumpToMaterials = () => {
    setShowPrecheck(false);
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/materials/index' });
    }, 200);
  };

  const handleConfirmSubmit = () => {
    setShowPrecheck(false);
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '已提交审核', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/messages/index' });
      }, 800);
    }, 1200);
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
          {isLastGroup ? '预审清单' : '下一步'}
        </Button>
      </View>

      {/* 预审清单弹窗 */}
      {showPrecheck && (
        <View className={styles.precheckMask} onClick={(e) => {
          if (e.target === e.currentTarget) setShowPrecheck(false);
        }}>
          <View className={styles.precheckSheet}>
            <View className={styles.precheckHeader}>
              <Text className={styles.precheckTitle}>
                📋 申报预审清单
              </Text>
              <Text className={styles.precheckClose} onClick={() => setShowPrecheck(false)}>×</Text>
            </View>

            <ScrollView className={styles.precheckBody} scrollY>
              {/* 总体进度 */}
              <View className={styles.precheckSection}>
                <View className={styles.sectionTitle}>📊 填报进度概览</View>
                <View className={styles.precheckProgress}>
                  <Text className={styles.progressText}>
                    已填 {precheckData.totalDone} / {precheckData.totalRequired} 项必填
                  </Text>
                  <Text className={styles.progressPct}>{precheckData.overallPct}%</Text>
                </View>
                <View className={styles.precheckProgressBar}>
                  <View className={styles.progressFill} style={{ width: `${precheckData.overallPct}%` }} />
                </View>
                <View className={styles.groupProgressList}>
                  {precheckData.groupProgress.map((gp, idx) => (
                    <View
                      key={gp.id}
                      className={classnames(
                        styles.groupProgressItem,
                        currentQuestionGroupIndex === idx && styles.active
                      )}
                      onClick={() => handleJumpToGroup(idx)}
                    >
                      <Text className={styles.groupName}>
                        {idx + 1}. {gp.title}
                      </Text>
                      <Text className={classnames(styles.groupStatus, styles[gp.status])}>
                        {gp.status === 'done' ? '✓ 已完成' :
                          gp.status === 'partial' ? `${gp.done}/${gp.total} 项` : '未填写'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 缺失项 */}
              <View className={styles.precheckSection}>
                <View className={styles.sectionTitle}>
                  ⚠️ 缺失的必填项
                  {precheckData.missingList.length > 0 && (
                    <Text style={{ color: '#fa8c16', fontSize: 24 }}>
                      （{precheckData.missingList.length}项）
                    </Text>
                  )}
                </View>
                {precheckData.missingList.length > 0 ? (
                  precheckData.missingList.map(item => (
                    <View
                      key={item.questionId}
                      className={styles.missingItem}
                      onClick={() => handleJumpToGroup(item.groupIndex)}
                    >
                      <Text className={styles.missingText}>
                        <Text className={styles.groupTag}>{item.groupTitle}</Text>
                        {item.questionText.replace(/[?？]$/, '')}
                      </Text>
                      <Text className={styles.jumpBtn}>去填写 ›</Text>
                    </View>
                  ))
                ) : (
                  <View className={styles.emptyHint}>✓ 所有必填项已完成</View>
                )}
              </View>

              {/* 所需材料 */}
              <View className={styles.precheckSection} onClick={handleJumpToMaterials}>
                <View className={styles.sectionTitle}>
                  📎 所需材料准备
                  <Text style={{ color: '#9ca3af', fontSize: 24 }}>
                    （{precheckData.materialsDoneCount}/{precheckData.materialBriefs.length}）
                  </Text>
                  <Text style={{ color: '#1677ff', fontSize: 24, marginLeft: 'auto' }}>
                    去处理 ›
                  </Text>
                </View>
                {precheckData.materialBriefs.map(m => (
                  <View key={m.id} className={styles.materialItem}>
                    <Text className={styles.matName}>{m.name}</Text>
                    <Text className={classnames(styles.matStatus, m.done ? 'done' : 'need')}>
                      {m.done ? '✓ 已上传' : '待上传'}
                    </Text>
                  </View>
                ))}
              </View>

              {/* 风险提醒 */}
              <View className={styles.precheckSection}>
                <View className={styles.sectionTitle}>
                  🔴 风险与提示
                  {precheckData.risks.length > 0 && (
                    <Text style={{ color: '#ff4d4f', fontSize: 24 }}>
                      （{precheckData.risks.length}条）
                    </Text>
                  )}
                </View>
                {precheckData.risks.length > 0 ? (
                  precheckData.risks.map((r, idx) => (
                    <View key={idx} className={styles.riskItem}>
                      <View className={styles.riskTitle}>{r.title}</View>
                      <View className={styles.riskText}>{r.content}</View>
                    </View>
                  ))
                ) : (
                  <View className={styles.emptyHint}>✓ 暂无风险提醒</View>
                )}
              </View>
            </ScrollView>

            <View className={styles.precheckFooter}>
              <Button className={classnames(styles.btn, styles.btnCancel)} onClick={() => setShowPrecheck(false)}>
                返回修改
              </Button>
              <Button
                className={classnames(styles.btn, styles.btnSubmit)}
                disabled={!canSubmit}
                onClick={handleConfirmSubmit}
              >
                {canSubmit ? '确认提交申报' : '请先完成缺失项'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AssistantPage;
