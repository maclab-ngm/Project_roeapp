// ========================================
// 회원가입 화면
// ========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authAPI } from '../api/client';

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('consumer'); // 'consumer' or 'business'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSignup = async () => {
    // 입력 검증
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert('오류', '모든 정보를 입력해주세요');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다');
      return;
    }

    try {
      setLoading(true);

      const userData = {
        ...formData,
        user_type: userType,
      };

      const response = await authAPI.signup(userData);

      Alert.alert('성공', `환영합니다, ${response.user.name}님!`, [
        {
          text: '확인',
          onPress: () => {
            // 사용자 유형에 따라 다른 화면으로 이동
            if (userType === 'business') {
              navigation.replace('BusinessHome');
            } else {
              navigation.replace('ConsumerHome');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>
        </View>

        {/* 사용자 유형 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>사용자 유형</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'consumer' && styles.typeButtonActive,
              ]}
              onPress={() => setUserType('consumer')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  userType === 'consumer' && styles.typeButtonTextActive,
                ]}
              >
                👤 소비자
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'business' && styles.typeButtonActive,
              ]}
              onPress={() => setUserType('business')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  userType === 'business' && styles.typeButtonTextActive,
                ]}
              >
                🏢 사업자
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 입력 폼 */}
        <View style={styles.section}>
          <Text style={styles.label}>
            이름 {userType === 'business' && '(학원명)'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={userType === 'business' ? '예: 종암영어학원' : '홍길동'}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="6자 이상"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
        </View>

        {/* MVP 안내 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📍 MVP 버전: 종암동 지역만 지원
          </Text>
          <Text style={styles.infoText}>
            💰 광고비: 100만원 / 포인트: 60만원 고정
          </Text>
        </View>

        {/* 가입 버튼 */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>가입하기</Text>
          )}
        </TouchableOpacity>

        {/* 로그인 링크 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>
            이미 계정이 있으신가요? <Text style={styles.loginLinkBold}>로그인</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
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
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkBold: {
    color: '#667eea',
    fontWeight: 'bold',
  },
});