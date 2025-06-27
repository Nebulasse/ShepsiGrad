import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Импортируем полифиллы
import './modules/global-polyfills';

export default function RootLayout() {
  useEffect(() => {
    console.log('[Layout] Корневой layout загружен');
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}