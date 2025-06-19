import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import MapPage from './pages/MapPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallback from './components/auth/AuthCallback';
import NotificationBell from './components/notifications/NotificationBell';
import { authService, User } from './services/authService';
import './App.css';

// Компонент защищенного маршрута
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const user = authService.getCurrentUser();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка авторизации при загрузке
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="logo">ShepsiGrad</Link>
            <nav className="main-nav">
              <ul>
                <li><Link to="/">Главная</Link></li>
                <li><Link to="/properties">Недвижимость</Link></li>
                <li><Link to="/map">Карта</Link></li>
                {user && <li><Link to="/favorites">Избранное</Link></li>}
                {user && <li><Link to="/chats">Сообщения</Link></li>}
              </ul>
            </nav>
            <div className="user-controls">
              {user ? (
                <>
                  <NotificationBell />
                  <Link to="/profile" className="profile-link">{user.full_name}</Link>
                  <button onClick={handleLogout} className="logout-button">Выйти</button>
                </>
              ) : (
                <Link to="/auth" className="auth-link">Войти</Link>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/favorites" 
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chats" 
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chats/:chatId" 
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ShepsiGrad</h3>
              <p>Сервис поиска и аренды недвижимости</p>
            </div>
            <div className="footer-section">
              <h3>Навигация</h3>
              <ul>
                <li><Link to="/">Главная</Link></li>
                <li><Link to="/properties">Недвижимость</Link></li>
                <li><Link to="/map">Карта</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Контакты</h3>
              <p>Email: info@shepsigrad.com</p>
              <p>Телефон: +7 (123) 456-78-90</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ShepsiGrad. Все права защищены.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App; 