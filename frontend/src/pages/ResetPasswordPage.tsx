import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/AuthPage.css';

enum ResetStage {
  REQUEST = 'request',
  CONFIRMATION = 'confirmation'
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<ResetStage>(ResetStage.REQUEST);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Обработка запроса на сброс пароля
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setMessage('Инструкции по сбросу пароля отправлены на ваш email.');
      setStage(ResetStage.CONFIRMATION);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  // Обработка подтверждения нового пароля
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }

    setLoading(true);

    try {
      // Извлекаем токен из URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        throw new Error('Отсутствует токен сброса пароля');
      }

      await authService.confirmPasswordReset(token, newPassword);
      setMessage('Пароль успешно изменен. Вы будете перенаправлены на страницу входа.');
      
      // Перенаправление на страницу входа через 3 секунды
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            {stage === ResetStage.REQUEST 
              ? 'Сброс пароля' 
              : 'Подтверждение сброса пароля'}
          </h2>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        {stage === ResetStage.REQUEST && (
          <form onSubmit={handleResetRequest} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Отправка...' : 'Сбросить пароль'}
            </button>
            
            <div className="auth-options">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => navigate('/auth')}
              >
                Вернуться на страницу входа
              </button>
            </div>
          </form>
        )}

        {stage === ResetStage.CONFIRMATION && (
          <form onSubmit={handleConfirmReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтверждение пароля</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 