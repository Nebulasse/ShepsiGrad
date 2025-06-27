import React, { useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Platform } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';

// Компоненты макета для веб-версии
import Header from '../src/components/layout/Header';
import Sidebar from '../src/components/layout/Sidebar';
import Footer from '../src/components/layout/Footer';
import { Box } from '@mui/material';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Для веб-платформы добавляем общий макет
  if (Platform.OS === 'web') {
    return (
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Slot />
              </Box>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  // Для мобильных платформ используем простой макет
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Slot />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 