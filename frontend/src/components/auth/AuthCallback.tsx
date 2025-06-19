import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        await authService.handleOAuthCallback();
        // После успешной аутентификации перенаправляем на главную страницу
        navigate('/', { replace: true });
      } catch (err: any) {
        console.error('Ошибка при авторизации через OAuth:', err);
        setError(err.message || 'Произошла ошибка при входе через социальную сеть');
        // В случае ошибки перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Ошибка аутентификации</h2>
          </div>
          <div className="auth-error">{error}</div>
          <p>Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Авторизация</h2>
        </div>
        <div className="auth-loading">
          <p>Выполняется вход в систему...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 