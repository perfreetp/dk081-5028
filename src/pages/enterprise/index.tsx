import React from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { memberList, licenseList } from '@/data/messages';
import classnames from 'classnames';

const EnterprisePage: React.FC = () => {
  const { isElderlyMode, toggleElderlyMode, resetAll, hydrateFromStorage } = useAppStore();

  React.useEffect(() => {
    hydrateFromStorage();
  }, []);

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

  const completedMembers = memberList.filter(m => m.infoCompleted).length;

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
              北京星辰科技有限公司
            </Text>
            <View className={styles.enterpriseStatus}>办理中 · 进度 33%</View>
          </View>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>统一社会信用代码</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              待生成
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>法定代表人</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              张伟
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>注册资本</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              100万元
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>成立日期</Text>
            <Text className={classnames(styles.infoValue, isElderlyMode && 'elderly-zoom-small')}>
              待设立
            </Text>
          </View>
        </View>
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
