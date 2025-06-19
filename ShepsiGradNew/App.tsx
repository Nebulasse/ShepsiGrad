import React from 'react';
import { View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import { SplashScreen } from 'expo-router';
import { LogBox } from 'react-native';

// Импорт основного компонента из expo-router
import { ExpoRoot } from 'expo-router';

// Отключаем предупреждения
LogBox.ignoreAllLogs();

// Определяем корневой компонент
export default function App() {
  const [fontsLoaded] = useFonts({
    // Здесь можно загрузить шрифты, если они нужны
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  // Используем ExpoRoot для загрузки приложения из папки app/
  return (
    <ExpoRoot context={require.context('./app')} onLayout={onLayoutRootView} />
  );
}
