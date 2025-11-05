// ========================================
// 사업자 홈 화면
// ========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authAPI, userAPI, adAPI } from '../api/client';

const TARGET_OPTIONS = [200, 500, 1000];
const USABLE_POINTS = 600000;

export default function BusinessHomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('list'); // 'list' or 'create'
  const [selectedImage, setSelectedImage] = useState(null);

  // 광고 등록 폼
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    target_count: 200,
  });

  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.resquestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [userResponse, adsResponse] = await Promise.all([
        userAPI.getMe(),
        adAPI.getMyAds(),
      ]);

      setUser(userResponse.user);
      setMyAds(adsResponse.ads);
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateAd = async () => {
    if (!adForm.title.trim()) {
      Alert.alert('오류', '광고 제목을 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      setModalVisible(false);

      const response = await adAPI.createAd(adForm);

      Alert.alert(
        '✅ 광고 등록 완료!',
        `광고가 성공적으로 등록되었습니다.\n\n` +
        `📊 광고 정보:\n` +
        `• 타겟 인원: ${adForm.target_count}명\n` +
        `• 1인당 포인트: ${response.budget_info.point_per_user.toLocaleString()}원\n` +
        `• 총 예산: ${response.budget_info.usable_points.toLocaleString()}원`,
        [
          {
            text: '확인',
            onPress: () => {
              // 폼 초기화 및 데이터 새로고침
              setAdForm({ title: '', description: '', target_count: 200 });
              setSelectedImage(null);
              loadData();
              setSelectedTab('list');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          navigation.replace('Welcome');
        },
      },
    ]);
  };

  const renderAdCard = ({ item }) => {
    const progress = parseFloat(item.progress) || 0;
    const viewedCount = item.target_count - item.remaining_count;

    return (
      <View style={styles.adCard}>
        {/* 이미지 표시 */}
        {item.image_url && (
          <Image
            source={{ url: `${API_BASE_URL}${item.image_url}`}}
            style={styles.adImage}
            resizeMode='cover'
            />
        )}


        <View style={styles.adCardHeader}>
          <View style={styles.adCardInfo}>
            <Text style={styles.adCardTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.adCardDescription}>{item.description}</Text>
            ) : null}
            <Text style={styles.adCardDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === 'active'
                ? styles.statusActive
                : styles.statusCompleted,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === 'active' ? '진행중' : '완료'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>타겟 인원</Text>
            <Text style={styles.statValue}>{item.target_count}명</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>1인당 포인트</Text>
            <Text style={styles.statValue}>
              {item.point_per_user.toLocaleString()}원
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>진행률</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {viewedCount}명 / {item.target_count}명 시청 완료
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#764ba2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>사업자 계정</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>총 광고</Text>
            <Text style={styles.statCardValue}>{myAds.length}개</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>진행중</Text>
            <Text style={styles.statCardValue}>
              {myAds.filter((ad) => ad.status === 'active').length}개
            </Text>
          </View>
        </View>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'list' && styles.tabActive]}
          onPress={() => setSelectedTab('list')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'list' && styles.tabTextActive,
            ]}
          >
            📋 내 광고
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'create' && styles.tabActive]}
          onPress={() => setSelectedTab('create')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'create' && styles.tabTextActive,
            ]}
          >
            ➕ 광고 등록
          </Text>
        </TouchableOpacity>
      </View>

      {/* 컨텐츠 */}
      {selectedTab === 'list' ? (
        // 내 광고 목록
        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#764ba2" />
            </View>
          ) : myAds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>등록된 광고가 없습니다</Text>
              <Text style={styles.emptySubtext}>첫 광고를 등록해보세요!</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setSelectedTab('create')}
              >
                <Text style={styles.createButtonText}>광고 등록하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myAds}
              renderItem={renderAdCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#764ba2']}
                />
              }
            />
          )}
        </View>
      ) : (
        // 광고 등록 폼
        <ScrollView style={styles.content} contentContainerStyle={styles.formContent}>
          <Text style={styles.formTitle}>새 광고 만들기</Text>

          {/* 이미지 선택 */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>광고 이미지 (선택사항)</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              {selectedImage ? (
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📷</Text>
                  <Text style={styles.imagePlaceholderSubtext}>
                    이미지 선택
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>광고 제목 *</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 겨울방학 특강 할인"
              value={adForm.title}
              onChangeText={(text) => setAdForm({ ...adForm, title: text })}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>광고 설명</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="광고 내용을 입력하세요"
              value={adForm.description}
              onChangeText={(text) => setAdForm({ ...adForm, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>타겟 인원 선택 *</Text>
            <View style={styles.optionsContainer}>
              {TARGET_OPTIONS.map((count) => {
                const pointPerUser = Math.floor(USABLE_POINTS / count);
                return (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.optionCard,
                      adForm.target_count === count && styles.optionCardActive,
                    ]}
                    onPress={() => setAdForm({ ...adForm, target_count: count })}
                  >
                    <Text
                      style={[
                        styles.optionCount,
                        adForm.target_count === count && styles.optionTextActive,
                      ]}
                    >
                      {count}명
                    </Text>
                    <Text
                      style={[
                        styles.optionPoint,
                        adForm.target_count === count && styles.optionTextActive,
                      ]}
                    >
                      {pointPerUser.toLocaleString()}원/인
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💰 MVP 고정 금액</Text>
            <Text style={styles.infoText}>• 총 광고비: 100만원</Text>
            <Text style={styles.infoText}>• ROE 수수료: 40만원</Text>
            <Text style={styles.infoText}>• 사용 가능 포인트: 60만원</Text>
            <Text style={styles.infoText}>• 지역: 성북구 전체</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCreateAd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>광고 등록하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// // API_BASE_URL import 추가
import { API_BASE_URL } from '../api/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#764ba2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  statCardLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#764ba2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#764ba2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  adCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  adCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  adCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  adCardDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusCompleted: {
    backgroundColor: '#e3f2fd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#764ba2',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#764ba2',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#764ba2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContent: {
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: '#764ba2',
    backgroundColor: '#f3e5f5',
  },
  optionCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionPoint: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#764ba2',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#764ba2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
