// ========================================
// API 클라이언트 (백엔드 통신)
// ========================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 베이스 URL - Mac IP 사용
const API_BASE_URL = 'http://172.30.1.72:3000';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/*
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 베이스 URL
// 로컬 테스트: 
// - Android 에뮬레이터: http://10.0.2.2:3000
// - iOS 시뮬레이터: http://localhost:3000
// - 실제 기기: http://YOUR_COMPUTER_IP:3000
const API_BASE_URL = 'http://172.30.1.72:3000'; // Android 기본값

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
*/

// 요청 인터셉터 (자동으로 토큰 추가)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('roe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)

api.interceptors.response.use(
  (response) => {
    console.log('✅ API 성공:', response.config.url);
    return response.data;
  },
  (error) => {
    console.log('❌ API 에러:', error.message);
    console.log('URL:', error.config?.url);
    console.log('상태:', error.response?.status);
    
    if (error.response) {
      console.log('서버 응답:', error.response.data);
      throw new Error(error.response.data.error || '서버 오류가 발생했습니다');
    } else if (error.request) {
      console.log('요청 실패:', error.request);
      throw new Error('서버에 연결할 수 없습니다');
    } else {
      console.log('설정 오류:', error.message);
      throw new Error('요청 중 오류가 발생했습니다');
    }
  }
);
/*
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      throw new Error(error.response.data.error || '서버 오류가 발생했습니다');
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      throw new Error('서버에 연결할 수 없습니다');
    } else {
      // 기타 오류
      throw new Error('요청 중 오류가 발생했습니다');
    }
  }
);
*/

// ========================================
// API 함수들
// ========================================

export const authAPI = {
  // 회원가입
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    
    // 토큰 저장
    if (response.token) {
      await AsyncStorage.setItem('roe_token', response.token);
      await AsyncStorage.setItem('roe_user_type', response.user.user_type);
    }
    
    return response;
  },

  // 로그인
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    
    // 토큰 저장
    if (response.token) {
      await AsyncStorage.setItem('roe_token', response.token);
      await AsyncStorage.setItem('roe_user_type', response.user.user_type);
    }
    
    return response;
  },

  // 로그아웃
  logout: async () => {
    await AsyncStorage.removeItem('roe_token');
    await AsyncStorage.removeItem('roe_user_type');
  },
};

export const userAPI = {
  // 내 정보 조회
  getMe: async () => {
    return await api.get('/api/users/me');
  },
};

export const adAPI = {
  // 볼 수 있는 광고 목록 (소비자)
  getAvailableAds: async () => {
    return await api.get('/api/ads/available');
  },

  // 내가 등록한 광고 목록 (사업자)
  getMyAds: async () => {
    return await api.get('/api/ads/my');
  },

  // 광고 생성 (사업자)
  createAd: async (adData) => {
    return await api.post('/api/ads', adData);
  },

  // 광고 시청 (소비자)
  watchAd: async (adId) => {
    return await api.post(`/api/ads/${adId}/watch`);
  },
};

export default api;