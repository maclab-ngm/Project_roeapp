// ========================================
// 소비자 홈 화면
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
  Image, //추가!
} from 'react-native';
import { authAPI, userAPI, adAPI, API_BASE_URL } from '../api/client';

export default function ConsumerHomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 사용자 정보와 광고 목록 동시 로드
      const [userResponse, adsResponse] = await Promise.all([
        userAPI.getMe(),
        adAPI.getAvailableAds(),
      ]);

      setUser(userResponse.user);
      setAds(adsResponse.ads);
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

  const handleWatchAd = async (ad) => {
    Alert.alert(
      '광고 시청',
      `이 광고를 시청하시겠습니까?\n\n💰 적립 포인트: ${ad.point_per_user.toLocaleString()}원`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시청하기',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await adAPI.watchAd(ad.id);
              
              Alert.alert(
                '🎉 포인트 적립 완료!',
                `${response.points_earned.toLocaleString()}원이 적립되었습니다!\n\n총 포인트: ${response.total_points.toLocaleString()}원`,
                [
                  {
                    text: '확인',
                    onPress: () => loadData(), // 데이터 새로고침
                  },
                ]
              );
            } catch (error) {
              Alert.alert('오류', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  const renderAdCard = ({ item }) => (
    <View style={styles.adCard}>
    {/* 이미지 표시 (신규) */}
      {item.image_url && (
        <Image 
          source={{ uri: `${API_BASE_URL}${item.image_url}` }}
          style={styles.adImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.adHeader}>
        <View style={styles.adInfo}>
          <Text style={styles.adTitle}>{item.title}</Text>
          <Text style={styles.businessName}>🏢 {item.business_name}</Text>
          {item.description ? (
            <Text style={styles.adDescription}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.pointBadge}>
          <Text style={styles.pointText}>💰</Text>
          <Text style={styles.pointAmount}>
            {item.point_per_user.toLocaleString()}원
          </Text>
        </View>
      </View>

      <View style={styles.adFooter}>
        <Text style={styles.adMeta}>
          👥 남은 인원: {item.remaining_count}명
        </Text>
        <TouchableOpacity
          style={styles.watchButton}
          onPress={() => handleWatchAd(item)}
        >
          <Text style={styles.watchButtonText}>👁️ 광고 보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Text style={styles.userName}>{user.name}님</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 포인트 카드 */}
        <View style={styles.pointCard}>
          <Text style={styles.pointLabel}>보유 포인트</Text>
          <Text style={styles.pointValue}>
            {user.points.toLocaleString()}원
          </Text>
        </View>
      </View>

      {/* 광고 목록 */}
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>📍 종암동 광고</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshText}>새로고침</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : ads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>현재 볼 수 있는 광고가 없습니다</Text>
            <Text style={styles.emptySubtext}>
              새로운 광고가 등록되면 알려드릴게요!
            </Text>
          </View>
        ) : (
          <FlatList
            data={ads}
            renderItem={renderAdCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#667eea']}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

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
    backgroundColor: '#667eea',
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
  pointCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 16,
  },
  pointLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  pointValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    //padding: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // 이미지 스타일 추가
  adImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  adInfo: {
    flex: 1,
    marginRight: 12,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  pointBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    fontSize: 20,
    marginBottom: 4,
  },
  pointAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  adMeta: {
    fontSize: 13,
    color: '#666',
  },
  watchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  },
});