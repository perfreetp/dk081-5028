import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { memberList as initialMemberList, licenseList } from '@/data/messages';
import classnames from 'classnames';

const maskIdCard = (id: string): string => {
  if (!id) return '';
  if (id.length < 10) return id;
  return id.slice(0, 4) + '********' + id.slice(-4);
};

const EnterprisePage: React.FC = () => {
  const { isElderlyMode, toggleElderlyMode, resetAll, hydrateFromStorage, answers, tasks } = useAppStore();

  React.useEffect(() => {
    hydrateFromStorage();
  }, []);

  const getAns = (qid: string): string => {
    const ans = answers[qid];
    if (!ans) return '';
    if (Array.isArray(ans)) return ans.join('、');
    return ans;
  };

  // ============ 企业信息同步 ============
  const enterpriseData = useMemo(() => {
    const q1 = getAns('q1'); // 字号
    const q2 = getAns('q2'); // 行业
    const q3 = getAns('q3'); // 企业类型
    const q4 = getAns('q4'); // 注册资本
    const q5 = getAns('q5'); // 主营
    const q8 = getAns('q8'); // 法定代表人姓名
    const q9 = getAns('q9'); // 法定代表人身份证
    const q11 = getAns('q11'); // 注册地址区域
    const q12 = getAns('q12'); // 详细地址

    // 企业名称 = 区域 + 字号 + 行业 + 组织形式
    let companyName = '';
    const region = q11?.split('-')[0] || '北京';
    if (q1 && q2) {
      let suffix = '有限公司';
      if (q3?.includes('个体')) suffix = '';
      else if (q3?.includes('合伙')) suffix = '合伙企业';
      else if (q3?.includes('股份')) suffix = '股份有限公司';
      companyName = `${region}${q1}${q2.includes('服务') ? '' : q2.slice(0, 2)}${suffix}`.replace(/信息技术服务/g, '科技').replace(/批发和零售/g, '商贸');
    }

    // 进度：取license任务的进度（按category查找更可靠）
    const licenseTask = tasks.find(t => t.category === 'license');
    const progress = licenseTask?.progress ?? 0;

    // 状态文字
    let statusText = '待开始';
    if (progress > 0 && progress < 100) statusText = `办理中 · 进度 ${progress}%`;
    else if (progress >= 100) statusText = '已设立';

    const regCapital = q4 ? (q4.includes('万') ? q4 : `${q4}万元`) : '';

    return {
      companyName,
      statusText,
      legalPerson: q8,
      legalIdCardMask: maskIdCard(q9),
      regCapital,
      mainBusiness: q5,
      companyType: q3,
      registerAddress: (q11 && q12) ? `${q11}${q12}` : (q11 || q12 || ''),
      setupDate: progress >= 100 ? '2026-06-17' : ''
    };
  }, [answers, tasks]);

  // ============ 人员信息同步 ============
  const memberList = useMemo(() => {
    const q8 = getAns('q8'); // 法人姓名
    const q9 = getAns('q9'); // 法人身份证
    const q10 = getAns('q10'); // 是否有财务负责人
    const q7 = getAns('q7'); // 股东人数

    let newMembers = initialMemberList.map(m => {
      const updated = { ...m };
      if (m.role === 'legal' && q8) {
        updated.name = q8;
        updated.idCardMask = maskIdCard(q9) || '身份证待补充';
        updated.infoCompleted = !!(q8 && q9);
      }
      if (m.role === 'finance') {
        if (q10 === '暂时没有，后续补充') {
          updated.infoCompleted = false;
          updated.idCardMask = '待确定人员';
        } else if (q10 === '由股东兼任') {
          updated.idCardMask = '股东兼任';
          updated.infoCompleted = true;
        }
      }
      return updated;
    });

    // 如果股东人数多，添加股东占位
    if (q7 && q7 !== '仅1人（独资）') {
      const count = q7 === '2人' ? 1 : q7 === '3-5人' ? 3 : 5;
      const existingShareholders = newMembers.filter(m => m.role === 'shareholder').length;
      for (let i = existingShareholders; i < count; i++) {
        newMembers.push({
          id: `shareholder_extra_${i}`,
          name: `股东${i + 2}`,
          role: 'shareholder',
          roleName: '股东',
          avatar: 'G',
          phone: '待补充',
          idCardMask: '待上传身份证',
          infoCompleted: false
        });
      }
    }

    return newMembers;
  }, [answers]);

  const completedMembers = memberList.filter(m => m.infoCompleted).length;

  // ============ 其他 ============
  const handleInviteMember = (role: string) => {
    console.log('[EnterprisePage] 邀请成员:', role);
    Taro.showActionSheet({
      itemList: ['邀请股东补充信息', '邀请财务负责人', '邀请监事/其他人员'],
      success: (res) => {
        const options = [
          { role: '股东', fields: '身份证照片、持股比例、联系方式' },
          { role: '财务负责人', fields: '身份证照片、从业资格证、联系方式' },
          { role: '监事', fields: '身份证照片、联系方式' }
        ];
        const opt = options[res.tapIndex];
        Taro.showModal({
          title: `邀请${opt.role}`,
          content: `将生成邀请链接，对方填写以下信息后自动同步：\n${opt.fields}`,
          confirmText: '生成邀请',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.setClipboardData({
                data: 'https://yizhangtong.gov.cn/invite?code=X7K9M2',
                success: () => {
                  Taro.showToast({ title: '邀请链接已复制', icon: 'success' });
                }
              });
            }
          }
        });
      }
    });
  };

  const handleViewLicense = (name: string) => {
    console.log('[EnterprisePage] 查看证照:', name);
    Taro.showModal({
      title: name,
      content: '电子证照已归集至企业卡包，点击可查看高清证照并下载。\n\n注：电子证照与纸质证照具有同等法律效力。',
      showCancel: true,
      confirmText: '查看证照',
      cancelText: '知道了'
    });
  };

  const handleToggleElderly = () => {
    toggleElderlyMode();
    Taro.showToast({
      title: isElderlyMode ? '已退出大字模式' : '已开启大字模式',
      icon: 'success'
    });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '确认重置所有数据？',
      content: '此操作将清除所有已填写的草稿、材料上传记录、任务进度和消息已读状态，恢复到初始状态。',
      confirmText: '确认重置',
      cancelText: '取消',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          resetAll();
          Taro.showToast({ title: '已重置所有数据', icon: 'success' });
        }
      }
    });
  };

  const handleSettingItem = (label: string) => {
    console.log('[EnterprisePage] 设置项:', label);
    if (label === '常见问题') {
      Taro.showModal({
        title: '常见问题',
        content: 'Q: 办理需要多长时间？\nA: 材料齐全情况下1-3个工作日办结。\n\nQ: 可以委托他人办理吗？\nA: 可以，需上传授权委托书。\n\nQ: 费用是多少？\nA: 政府不收费，公章刻制等第三方服务约200-500元。',
        showCancel: false
      });
    } else if (label === '联系客服') {
      Taro.showModal({
        title: '联系客服',
        content: '服务热线：12345\n工作时间：9:00-17:30\n在线客服：点击转人工',
        confirmText: '拨打电话',
        success: (res) => {
          if (res.confirm) {
            Taro.makePhoneCall({ phoneNumber: '12345' });
          }
        }
      });
    } else if (label === '申报摘要') {
      Taro.switchTab({ url: '/pages/assistant/index' });
    } else if (label === '重置所有数据') {
      handleReset();
    } else {
      Taro.showToast({ title: `${label}功能开发中`, icon: 'none' });
    }
  };

  const settings = [
    { icon: '🔍', label: '申报摘要', desc: '查看已填写的所有信息', color: 'blue' },
    { icon: '❓', label: '常见问题', desc: '办事流程、材料要求等FAQ', color: 'purple' },
    { icon: '📞', label: '联系客服', desc: '12345热线 / 在线咨询', color: 'green' },
    { icon: '♻️', label: '重置所有数据', desc: '清除草稿、材料、进度和已读状态', color: 'red' },
    { icon: 'ℹ️', label: '关于我们', desc: '版本号 v1.0.0', color: 'gray' }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.enterpriseCard}>
        <View className={styles.enterpriseHeader}>
          <View className={styles.logo}>🏢</View>
          <View className={styles.enterpriseInfo}>
            <Text className={classnames(styles.enterpriseName, isElderlyMode && 'elderly-zoom-subtitle')}>
              {enterpriseData.companyName || '企业名称（待填写）'}
            </Text>
            <View className={styles.enterpriseStatus}>
              {enterpriseData.statusText || '待开始 · 请先填写企业信息'}
            </View>
          </View>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>统一社会信用代码</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              {enterpriseData.setupDate ? '91110105XXXXXXXXX' : '待设立生成'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>法定代表人</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              {enterpriseData.legalPerson || '— 待填写 —'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>注册资本</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              {enterpriseData.regCapital || '— 待填写 —'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>成立日期</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              {enterpriseData.setupDate || '待设立'}
            </Text>
          </View>
        </View>
        {(enterpriseData.companyType || enterpriseData.mainBusiness || enterpriseData.registerAddress) && (
          <View className={styles.infoGrid} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            {enterpriseData.companyType && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>企业类型</Text>
                <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
                  {enterpriseData.companyType}
                </Text>
              </View>
            )}
            {enterpriseData.mainBusiness && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>主营方向</Text>
                <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
                  {enterpriseData.mainBusiness}
                </Text>
              </View>
            )}
            {enterpriseData.registerAddress && (
              <View className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                <Text className={styles.infoLabel}>注册地址</Text>
                <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
                  {enterpriseData.registerAddress}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={classnames(styles.sectionTitle, isElderlyMode && 'elderly-zoom-text')}>
            <Text className={styles.sectionIcon}>👥</Text>
            人员信息 ({completedMembers}/{memberList.length})
          </Text>
        </View>
        <View className={styles.memberList}>
          {memberList.map(member => (
            <View key={member.id} className={styles.memberItem}>
              <View className={classnames(styles.memberAvatar, styles[member.role])}>
                {member.name.charAt(0)}
              </View>
              <View className={styles.memberInfo}>
                <View className={styles.memberHeader}>
                  <Text className={classnames(styles.memberName, isElderlyMode && 'elderly-zoom-text')}>
                    {member.name}
                  </Text>
                  <View className={classnames(
                    styles.memberStatus,
                    member.infoCompleted ? styles.completed : styles.pending
                  )}>
                    {member.infoCompleted ? '✓ 信息已完善' : '待补充'}
                  </View>
                </View>
                <Text className={styles.memberRole}>{member.roleName}</Text>
                <Text className={styles.memberPhone}>
                  {member.phone} · {member.idCardMask}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Button className={styles.inviteBtn} onClick={() => handleInviteMember('shareholder')}>
          + 邀请其他人员补充信息
        </Button>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={classnames(styles.sectionTitle, isElderlyMode && 'elderly-zoom-text')}>
            <Text className={styles.sectionIcon}>📜</Text>
            电子证照
          </Text>
          <Text className={styles.sectionAction} onClick={() => handleViewLicense('全部')}>
            全部 →
          </Text>
        </View>
        <View className={styles.licenseList}>
          {licenseList.map(license => (
            <View
              key={license.id}
              className={styles.licenseItem}
              onClick={() => handleViewLicense(license.name)}
            >
              <View className={styles.licenseIcon}>📄</View>
              <View className={styles.licenseInfo}>
                <Text className={classnames(styles.licenseName, isElderlyMode && 'elderly-zoom-text')}>
                  {license.name}
                </Text>
                <Text className={styles.licenseMeta}>
                  {license.type} · 有效期至 {license.expireDate}
                </Text>
              </View>
              <Text className={styles.licenseArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={classnames(styles.sectionTitle, isElderlyMode && 'elderly-zoom-text')}>
            <Text className={styles.sectionIcon}>⚙️</Text>
            设置
          </Text>
        </View>
        <View className={styles.settingsList}>
          <View className={styles.settingItem}>
            <View className={classnames(styles.settingIcon, styles.orange)}>🔎</View>
            <View className={styles.settingContent}>
              <Text className={classnames(styles.settingLabel, isElderlyMode && 'elderly-zoom-text')}>
                适老化大字模式
              </Text>
              <Text className={styles.settingDesc}>
                放大字号和按钮，方便年长创业者使用
              </Text>
            </View>
            <View
              className={classnames(styles.switchWrap, isElderlyMode && styles.active)}
              onClick={handleToggleElderly}
            >
              <View className={styles.switchDot} />
            </View>
          </View>

          {settings.map((setting, idx) => (
            <View
              key={idx}
              className={styles.settingItem}
              onClick={() => handleSettingItem(setting.label)}
            >
              <View className={classnames(styles.settingIcon, styles[setting.color])}>
                {setting.icon}
              </View>
              <View className={styles.settingContent}>
                <Text className={classnames(styles.settingLabel, isElderlyMode && 'elderly-zoom-text')}>
                  {setting.label}
                </Text>
                <Text className={styles.settingDesc}>{setting.desc}</Text>
              </View>
              <Text className={styles.settingArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default EnterprisePage;
