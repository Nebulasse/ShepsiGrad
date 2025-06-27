import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Компоненты макета
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Страницы
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import BookingsList from './pages/BookingsList';
import BookingDetails from './pages/BookingDetails';
import PropertiesList from './pages/PropertiesList';
import PropertyDetails from './pages/PropertyDetails';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import ReviewsList from './pages/ReviewsList';
import NotFound from './pages/NotFound';

// Контекст авторизации
import { AuthProvider } from './contexts/AuthContext';

// Стили
import { Box } from '@mui/material';

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/bookings" element={<BookingsList />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/properties" element={<PropertiesList />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/reviews" element={<ReviewsList />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 