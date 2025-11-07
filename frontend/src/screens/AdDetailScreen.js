// ========================================
// 광고 상세 화면 (광고 시청)
// ========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { adAPI, API_BASE_URL } from '../api/client';

export default function AdDetailScreen({ route, navigation }) {
  const { ad, onAdComplete } = route.params;
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5초 타이머

  // 타이머 시작
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleWatchComplete = async () => {
    if (timeLeft > 0) {
      Alert.alert('안내', `광고를 ${timeLeft}초 더 시청해주세요`);
      return;
    }

    try {
      setLoading(true);
      const response = await adAPI.watchAd(ad.id);

      Alert.alert(
        '🎉 포인트 적립 완료!',
        `${response.points_earned.toLocaleString()}원이 적립되었습니다!\n\n총 포인트: ${response.total_points.toLocaleString()}원`,
        [
          {
            text: '확인',
            onPress: () => {
              if (onAdComplete) onAdComplete();
              navigation.goBack();
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

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>광고 상세</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 광고 이미지 */}
        {ad.image_url ? (
          <Image
            source={{ uri: `${API_BASE_URL}${ad.image_url}` }}
            style={styles.adImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>📷</Text>
            <Text style={styles.noImageSubtext}>이미지가 없습니다</Text>
          </View>
        )}

        {/* 광고 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.businessName}>🏢 {ad.business_name}</Text>
          <Text style={styles.adTitle}>{ad.title}</Text>
          
          {ad.description ? (
            <Text style={styles.adDescription}>{ad.description}</Text>
          ) : null}

          {/* 포인트 카드 */}
          <View style={styles.pointCard}>
            <Text style={styles.pointLabel}>시청 완료 시 적립</Text>
            <Text style={styles.pointValue}>
              💰 {ad.point_per_user.toLocaleString()}원
            </Text>
          </View>

          {/* 광고 정보 */}
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>남은 인원</Text>
              <Text style={styles.detailValue}>{ad.remaining_count}명</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>광고 기간</Text>
              <Text style={styles.detailValue}>{ad.duration_days || 30}일</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        {timeLeft > 0 ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              ⏱️ {timeLeft}초 후 시청 완료 가능
            </Text>
          </View>
        ) : null}
        
        <TouchableOpacity
          style={[
            styles.completeButton,
            (loading || timeLeft > 0) && styles.completeButtonDisabled,
          ]}
          onPress={handleWatchComplete}
          disabled={loading || timeLeft > 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.completeButtonText}>
              {timeLeft > 0 ? `${timeLeft}초 대기 중...` : '✓ 시청 완료'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  adImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  noImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 60,
    marginBottom: 8,
  },
  noImageSubtext: {
    fontSize: 14,
    color: '#999',
  },
  infoContainer: {
    padding: 20,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  adDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  pointCard: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointLabel: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
  },
  pointValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  detailBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  timerContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});