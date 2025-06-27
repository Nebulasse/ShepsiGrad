import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Компоненты макета
import Header from './src/components/layout/Header';
import Sidebar from './src/components/layout/Sidebar';
import Footer from './src/components/layout/Footer';

// Страницы
import Dashboard from './src/pages/Dashboard';
import Login from './src/pages/Login';
import BookingsList from './src/pages/BookingsList';
import NotFound from './src/pages/NotFound';

// Контекст авторизации
import { AuthProvider } from './src/contexts/AuthContext';

// Стили
import { Box } from '@mui/material';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

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

  // Для веб-платформы используем React Router
  if (Platform.OS === 'web') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* Здесь будет маршрутизация React Router для веб */}
                <Dashboard />
              </Box>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  // Для мобильных платформ используем React Navigation
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="BookingsList" component={BookingsList} options={{ title: 'Бронирования' }} />
              <Stack.Screen name="NotFound" component={NotFound} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default registerRootComponent(App); 