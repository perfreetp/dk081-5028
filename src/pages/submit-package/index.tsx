import { useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { useAppStore } from '@/store/useAppStore';
import { questionGroups } from '@/data/questions';
import { MaterialItem, AnswerValue } from '@/types';
import styles from './index.module.scss';

const requiredQuestions = questionGroups
  .flatMap(g => g.questions.filter(q => q.required))
  .map(q => q.id);

export default function SubmitPackage() {
  const router = useRouter();
  const {
    answers,
    materials,
    updateTaskProgress,
    addMessage,
    updateMaterialStatus,
    submitMaterialsForReview,
    updateEnterpriseInfo,
    tasks
  } = useAppStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCreditCode] = useState(`91110105${Math.floor(Math.random() * 900000000000000000}1`);
  const [establishDate] = useState(new Date().toISOString().split('T')[0]);

  const getAnswerText = (qid: string): string => {
    const v = answers[qid];
    if (v == null) return '';
    if (Array.isArray(v)) return v.join('、');
    return String(v);
  };

  const summaryItems = [
    { label: '企业字号', qid: 'q1', groupId: 'g1' },
    { label: '所属行业', qid: 'q2', groupId: 'g1' },
    { label: '企业类型', qid: 'q3', groupId: 'g1' },
    { label: '注册资本(万元)', qid: 'q4', groupId: 'g1' },
    { label: '主营业务', qid: 'q5', groupId: 'g2' },
    { label: '股东人数', qid: 'q7', groupId: 'g3' },
    { label: '法定代表人', qid: 'q8', groupId: 'g3' },
    { label: '法人身份证', qid: 'q9', groupId: 'g3' },
    { label: '注册地址', qid: 'q11', groupId: 'g4' },
    { label: '详细地址', qid: 'q12', groupId: 'g4' },
    { label: '场地性质', qid: 'q13', groupId: 'g4' },
    { label: '社保登记', qid: 'q14', groupId: 'g5' },
    { label: '发票类型', qid: 'q15', groupId: 'g5' }
  ];

  const missingRequired = requiredQuestions.filter(qid => {
    const v = answers[qid];
    return v == null || v === '' || (Array.isArray(v) && v.length === 0);
  });

  const missingMaterials = materials.filter(m => m.status === 'not_uploaded').length;

  const hasMissing = missingRequired.length > 0 || missingMaterials > 0;

  const totalItems = materials.length;
  const doneItems = materials.filter(m => m.status !== 'not_uploaded').length;

  const signItems = materials
    .filter(m => m.needSign)
    .map(m => ({
      id: m.id,
      name: m.name,
      signed: m.signed
    }));

  const signedCount = signItems.filter(s => s.signed).length;

  const risks = [];

  const capitalText = getAnswerText('q4');
  if (capitalText && capitalText.trim()) {
    const num = parseFloat(capitalText.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) {
      if (num === 0) {
        risks.push({ type: 'danger' as const, title: '注册资本不能为0', content: '注册资本不能为0，请根据企业实际经营情况填写。' });
      } else if (num < 10) {
        risks.push({ type: 'warning' as const, title: `注册资本 ${num} 万元偏低`, content: '建议小微企业注册资本填写 50-500 万，过低可能影响客户信任和投标资格。' });
      }
    }
  }

  const legalIdCard = getAnswerText('q9');
  if (legalIdCard && legalIdCard.trim()) {
    const digits = legalIdCard.replace(/[^0-9Xx]/g, '');
    if (digits.length !== 18) {
      risks.push({ type: 'danger' as const, title: '身份证号位数不对', content: `居民身份证号应为18位（含末尾X），当前只输入了${digits.length}位。` });
    }
  }

  const inReviewCount = materials.filter(m => m.status === 'in_review').length;
  if (inReviewCount > 0) {
    risks.push({ type: 'info' as const, title: `有 ${inReviewCount} 份材料正在审核中`, content: '审核通常1-2个工作日内完成，如有问题会通过消息通知您。' });
  }

  const rejectedCount = materials.filter(m => m.status === 'rejected').length;
  if (rejectedCount > 0) {
    risks.push({ type: 'danger' as const, title: `有 ${rejectedCount} 份材料被退回`, content: '被退回的材料需要按照要求修改后重新上传。' });
  }

  const needSignCount = materials.filter(m => (m.status === 'need_sign' || (m.needSign && !m.signed && (m.status === 'uploaded' || m.status === 'in_review')))).length;
  if (needSignCount > 0) {
    risks.push({ type: 'warning' as const, title: `有 ${needSignCount} 份材料需要签字盖章`, content: '未签字盖章的材料无法通过审核。' });
  }

  const companyType = getAnswerText('q3');
  const shareholderCount = getAnswerText('q7');
  if (companyType?.includes('有限责任') && shareholderCount === '仅1人（独资）') {
    risks.push({ type: 'info' as const, title: '自然人独资企业提示', content: '一人有限责任公司每年需审计且股东需证明个人财产独立于公司财产。' });
  }

  const goToGroup = (groupId: string) => {
    Taro.navigateTo({ url: `/pages/assistant/index?group=` + groupId });
  };

  const goToMaterials = () => {
    Taro.switchTab({ url: '/pages/materials/index' });
  };

  const handleSubmit = async () => {
    if (hasMissing) {
      Taro.showModal({
        title: '还有内容未完成',
        content: missingRequired.length > 0 ? `还缺 ${missingRequired.length} 项必填信息` : `还缺 ${missingMaterials} 份材料`,
        showCancel: true,
        confirmText: '去完善',
        success: (res) => {
          if (res.confirm) {
            if (missingRequired.length > 0) {
              const firstMissing = missingRequired[0];
              const group = questionGroups.find(g => g.questions.some(q => q.id === firstMissing));
              if (group) goToGroup(group.id);
            } else {
              goToMaterials();
            }
          }
        }
      });
      return;
    }

    Taro.showLoading({ title: '提交中...' });

    try {
      const submitted = submitMaterialsForReview();
      updateTaskProgress('license', 100);

      const companyName = `${getAnswerText('q1')}${getAnswerText('q2')?.replace('业', '') || ''}${getAnswerText('q3')?.includes('有限公司') ? '有限公司' : '合伙企业'}`;
      updateEnterpriseInfo({
        name: companyName,
        creditCode: generatedCreditCode,
        establishDate,
        hasElicense: true
      });

      addMessage({
        id: `msg_submit_${Date.now()}`,
        title: '申报已提交成功',
        content: `您的${getAnswerText('q1') || '企业'}的设立登记申请已提交成功，我们将在1-2个工作日内完成审核。`,
        type: 'progress',
        typeName: '办理进度',
        category: 'license',
        read: false,
        time: new Date().toISOString(),
        relatedTaskId: 't1'
      });

      if (submitted > 0) {
        addMessage({
          id: `msg_review_${Date.now()}`,
          title: `${submitted} 份材料进入审核`,
          content: '工作人员正在审核您的申请材料，如有需要补正会及时通知您。',
          type: 'progress',
          typeName: '办理进度',
          category: 'materials',
          read: false,
          time: new Date().toISOString(),
          relatedTaskId: 't1'
        });
      }

      setTimeout(() => {
        Taro.hideLoading();
        setShowSuccess(true);
      }, 800);
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: '提交失败', icon: 'error' });
    }
  };

  const handleViewMessages = () => {
    Taro.switchTab({ url: '/pages/messages/index' });
  };

  const handleViewEnterprise = () => {
    Taro.switchTab({ url: '/pages/enterprise/index' });
  };

  const getMatStatusClass = (status: MaterialItem['status']) => {
    switch (status) {
      case 'verified': return 'done';
      case 'in_review': return 'review';
      case 'uploaded': return 'done';
      case 'need_sign': return 'need';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const getMatStatusText = (status: MaterialItem['status']) => {
    switch (status) {
      case 'verified': return '已核验';
      case 'in_review': return '审核中';
      case 'uploaded': return '已上传';
      case 'need_sign': return '待签字';
      case 'rejected': return '已退回';
      default: return '待上传';
    }
  };

  const getRiskClass = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      default: return 'info';
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.title}>
          <Text>📋</Text>
          <Text>申报确认</Text>
        </View>
        <View className={styles.subtitle}>请仔细核对以下信息，确认无误后提交</View>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{summaryItems.filter(s => getAnswerText(s.qid)).length}</View>
            <View className={styles.statLabel}>已填项</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{doneItems}/{totalItems}</View>
            <View className={styles.statLabel}>材料</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{signedCount}/{signItems.length}</View>
            <View className={styles.statLabel}>签字</View>
          </View>
          <View className={styles.statItem}>
            <View className={styles.statNum}>{risks.length}</View>
            <View className={styles.statLabel}>提示</View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text>📝</Text>
            <Text>填报摘要</Text>
          </View>
          <View className={styles.sectionAction} onClick={() => goToGroup('g1')}>返回修改</View>
        </View>
        <View className={styles.summaryList}>
          {summaryItems.map(item => {
            const val = getAnswerText(item.qid);
            const isMissing = !val || val.trim() === '';
            return (
              <View key={item.qid} className={styles.summaryItem} onClick={() => goToGroup(item.groupId)}>
                <Text className={styles.label}>
                  {requiredQuestions.includes(item.qid) && <Text className={styles.required}>*</Text>}
                  {item.label}
                </Text>
                <Text className={isMissing ? styles.missing : styles.value}>
                  {isMissing ? '未填写' : val}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text>📎</Text>
            <Text>材料清单</Text>
          </View>
          <View className={styles.sectionAction} onClick={goToMaterials}>去材料袋</View>
        </View>
        <View className={styles.materialList}>
          {materials.map(m => (
            <View key={m.id} className={styles.materialItem} onClick={goToMaterials}>
              <Text className={styles.matName}>{m.name}</Text>
              <Text className={`${styles.matStatus} ${styles[getMatStatusClass(m.status)]}`}>
                {getMatStatusText(m.status)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text>✍️</Text>
            <Text>签字情况</Text>
          </View>
        </View>
        <View className={styles.signSection}>
          {signItems.length === 0 ? (
            <View className={styles.emptyHint}>暂无需要签字的材料</View>
          ) : (
            signItems.map(s => (
              <View key={s.id} className={styles.signItem}>
                <Text className={styles.signName}>{s.name}</Text>
                <Text className={`${styles.signStatus} ${s.signed ? styles.signed : styles.pending}`}>
                  {s.signed ? '已签字' : '待签字'}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text>⚠️</Text>
            <Text>风险与提示</Text>
          </View>
        </View>
        <View className={styles.riskList}>
          {risks.length === 0 ? (
            <View className={styles.emptyHint}>暂无风险提示</View>
          ) : (
            risks.map((r, idx) => (
              <View key={idx} className={`${styles.riskItem} ${styles[getRiskClass(r.type)]}`}>
                <View className={styles.riskTitle}>{r.title}</View>
                <View className={styles.riskText}>{r.content}</View>
              </View>
            ))
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => Taro.navigateBack()}>取消</Button>
        <Button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleSubmit}
        >
          {hasMissing ? '继续完善' : '确认提交申报'}
        </Button>
      </View>

      {showSuccess && (
        <View className={styles.successMask}>
          <View className={styles.successIcon}>✓</View>
          <View className={styles.successTitle}>申报提交成功！</View>
          <View className={styles.successSubtitle}>
            您的营业执照申请已受理，预计1-2个工作日内完成审核
          </View>

          <View className={styles.successCredit}>
            <View className={styles.label}>统一社会信用代码</View>
            <View className={styles.code}>{generatedCreditCode}</View>
          </View>

          <View className={styles.successCredit}>
            <View className={styles.label}>成立日期</View>
            <View className={styles.code}>{establishDate}</View>
          </View>

          <View className={styles.successActions}>
            <Button className={`${styles.successBtn} ${styles.outline}`} onClick={handleViewMessages}>查看消息</Button>
            <Button className={`${styles.successBtn} ${styles.primary}`} onClick={handleViewEnterprise}>我的企业</Button>
          </View>
        </View>
      )}
    </View>
  );
}
