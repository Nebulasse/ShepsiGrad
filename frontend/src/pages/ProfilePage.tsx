import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User } from '../services/authService';
import SocialButton from '../components/auth/SocialButton';
import '../styles/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/auth');
          return;
        }
        
        setUser(currentUser);
        setEmail(currentUser.email);
        setFullName(currentUser.full_name);
        setPhoneNumber(currentUser.phone_number || '');
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Обработка сохранения данных профиля
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Здесь будет логика обновления профиля
      // await authService.updateProfile({ fullName, phoneNumber });
      
      // Временно имитируем успешное обновление
      setTimeout(() => {
        if (user) {
          const updatedUser = {
            ...user,
            full_name: fullName,
            phone_number: phoneNumber
          };
          setUser(updatedUser);
          setIsEditing(false);
        }
        setIsSaving(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля');
      setIsSaving(false);
    }
  };

  // Обработка входа через VK
  const handleVKConnect = async () => {
    try {
      await authService.loginWithVK();
    } catch (err: any) {
      setError(err.message || 'Ошибка при подключении ВКонтакте');
    }
  };

  // Обработка входа через Google
  const handleGoogleConnect = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Ошибка при подключении Google');
    }
  };

  // Обработка выхода
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/auth');
    } catch (err: any) {
      setError(err.message || 'Ошибка при выходе из системы');
    }
  };

  if (loading) {
    return <div className="loading-container">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Профиль пользователя</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              {user?.avatar ? (
                <img src={user.avatar} alt="Аватар" className="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.full_name.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2>{user?.full_name}</h2>
              <p className="user-role">{user?.role === 'landlord' ? 'Арендодатель' : 'Пользователь'}</p>
            </div>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  readOnly
                  disabled
                  className="input-readonly"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fullName">Полное имя</label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Телефон</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+7XXXXXXXXXX"
                />
              </div>
              
              <div className="profile-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    // Восстанавливаем значения из пользователя
                    if (user) {
                      setFullName(user.full_name);
                      setPhoneNumber(user.phone_number || '');
                    }
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Полное имя:</span>
                <span className="detail-value">{user?.full_name}</span>
              </div>
              
              {user?.phone_number && (
                <div className="detail-item">
                  <span className="detail-label">Телефон:</span>
                  <span className="detail-value">{user.phone_number}</span>
                </div>
              )}
              
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать профиль
              </button>
            </div>
          )}
        </div>
        
        <div className="social-accounts-card">
          <h3>Подключенные аккаунты</h3>
          <p className="social-info">
            Подключите аккаунты социальных сетей для быстрого входа в систему
          </p>
          
          <div className="social-accounts-list">
            <div className="social-account-item">
              <div className="social-account-info">
                <span className="social-provider">ВКонтакте</span>
                <span className="social-status">
                  {false ? 'Подключено' : 'Не подключено'}
                </span>
              </div>
              <SocialButton 
                provider="vk" 
                onClick={handleVKConnect} 
              />
            </div>
            
            <div className="social-account-item">
              <div className="social-account-info">
                <span className="social-provider">Google</span>
                <span className="social-status">
                  {false ? 'Подключено' : 'Не подключено'}
                </span>
              </div>
              <SocialButton 
                provider="google" 
                onClick={handleGoogleConnect} 
              />
            </div>
          </div>
        </div>
        
        <div className="logout-container">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 