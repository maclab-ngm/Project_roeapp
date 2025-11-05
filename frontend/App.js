// ========================================
// ROE MVP - 메인 앱 파일
// ========================================

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// 화면 컴포넌트
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import ConsumerHomeScreen from './src/screens/ConsumerHomeScreen';
import BusinessHomeScreen from './src/screens/BusinessHomeScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('roe_token');
      const userType = await AsyncStorage.getItem('roe_user_type');
      
      if (token && userType) {
        // 토큰이 있으면 해당 홈으로 이동
        setInitialRoute(userType === 'business' ? 'BusinessHome' : 'ConsumerHome');
      }
    } catch (error) {
      console.error('토큰 확인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // 로딩 화면 (필요시 추가)
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ConsumerHome" component={ConsumerHomeScreen} />
          <Stack.Screen name="BusinessHome" component={BusinessHomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}