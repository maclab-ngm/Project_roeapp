// ========================================
// 로그인 화면
// ========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authAPI } from '../api/client';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 입력 검증
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      const response = await authAPI.login(email, password);

      Alert.alert('성공', `환영합니다, ${response.user.name}님!`, [
        {
          text: '확인',
          onPress: () => {
            // 사용자 유형에 따라 다른 화면으로 이동
            if (response.user.user_type === 'business') {
              navigation.replace('BusinessHome');
            } else {
              navigation.replace('ConsumerHome');
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('로그인 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>로그인</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* 회원가입 링크 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={styles.signupLink}
          >
            <Text style={styles.signupLinkText}>
              계정이 없으신가요? <Text style={styles.signupLinkBold}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 테스트 계정 안내 */}
        <View style={styles.testInfoBox}>
          <Text style={styles.testInfoTitle}>🧪 테스트 계정</Text>
          <Text style={styles.testInfoText}>소비자: test_consumer@roe.com</Text>
          <Text style={styles.testInfoText}>사업자: test_business@roe.com</Text>
          <Text style={styles.testInfoText}>비밀번호: test123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
  form: {
    flex: 1,
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
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 14,
    color: '#666',
  },
  signupLinkBold: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  testInfoBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  testInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 12,
    color: '#856404',
    marginTop: 4,
  },
});