import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import SocialButton from '../components/auth/SocialButton';
import '../styles/AuthPage.css';

// Импорт иконок для социальных сетей
import googleIcon from '../assets/icons/google.svg';
import facebookIcon from '../assets/icons/facebook.svg';
import vkIcon from '../assets/icons/vk.svg';

enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
  PHONE = 'phone',
  OTP_VERIFY = 'otp_verify'
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Обработка входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  // Обработка регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register(email, password, {
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'user'
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Отправка OTP на телефон
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const result = await authService.sendPhoneOtp(phoneNumber);
      setMessage(result.message);
      setMode(AuthMode.OTP_VERIFY);
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  // Проверка OTP и вход
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.loginWithPhone({ phone: phoneNumber, otp });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Неверный код подтверждения');
    } finally {
      setLoading(false);
    }
  };

  // Переключение на вход по телефону
  const switchToPhoneLogin = () => {
    setError(null);
    setMessage(null);
    setMode(AuthMode.PHONE);
  };

  // Перейти на страницу сброса пароля
  const goToResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            {mode === AuthMode.LOGIN && 'Вход'}
            {mode === AuthMode.REGISTER && 'Регистрация'}
            {mode === AuthMode.PHONE && 'Вход по номеру телефона'}
            {mode === AuthMode.OTP_VERIFY && 'Подтверждение кода'}
          </h2>
          {(mode === AuthMode.LOGIN || mode === AuthMode.REGISTER) && (
            <div className="auth-toggle">
              <button
                className={mode === AuthMode.LOGIN ? 'active' : ''}
                onClick={() => setMode(AuthMode.LOGIN)}
              >
                Вход
              </button>
              <button
                className={mode === AuthMode.REGISTER ? 'active' : ''}
                onClick={() => setMode(AuthMode.REGISTER)}
              >
                Регистрация
              </button>
            </div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        {mode === AuthMode.LOGIN && (
          <form onSubmit={handleLogin} className="auth-form">
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

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Выполняется вход...' : 'Войти'}
            </button>
            
            <div className="auth-options">
              <button 
                type="button" 
                className="link-button" 
                onClick={switchToPhoneLogin}
              >
                Войти по номеру телефона
              </button>
              <button 
                type="button" 
                className="link-button" 
                onClick={goToResetPassword}
              >
                Забыли пароль?
              </button>
            </div>
            
            <div className="social-auth">
              <p>или войдите через</p>
              <div className="social-buttons">
                <SocialButton 
                  provider="google" 
                  label="Google" 
                  icon={googleIcon} 
                />
                <SocialButton 
                  provider="facebook" 
                  label="Facebook" 
                  icon={facebookIcon} 
                />
                <SocialButton 
                  provider="vk" 
                  label="ВКонтакте" 
                  icon={vkIcon} 
                />
              </div>
            </div>
          </form>
        )}

        {mode === AuthMode.REGISTER && (
          <form onSubmit={handleRegister} className="auth-form">
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
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+7XXXXXXXXXX"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            
            <div className="auth-options">
              <button 
                type="button" 
                className="link-button" 
                onClick={switchToPhoneLogin}
              >
                Войти по номеру телефона
              </button>
            </div>
            
            <div className="social-auth">
              <p>или зарегистрируйтесь через</p>
              <div className="social-buttons">
                <SocialButton 
                  provider="google" 
                  label="Google" 
                  icon={googleIcon} 
                />
                <SocialButton 
                  provider="facebook" 
                  label="Facebook" 
                  icon={facebookIcon} 
                />
                <SocialButton 
                  provider="vk" 
                  label="ВКонтакте" 
                  icon={vkIcon} 
                />
              </div>
            </div>
          </form>
        )}
        
        {mode === AuthMode.PHONE && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="phone">Номер телефона</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+7XXXXXXXXXX"
                required
              />
            </div>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Отправка кода...' : 'Отправить код'}
            </button>
            
            <div className="auth-options">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => setMode(AuthMode.LOGIN)}
              >
                Вернуться к входу по email
              </button>
            </div>
          </form>
        )}
        
        {mode === AuthMode.OTP_VERIFY && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="otp">Код подтверждения</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Введите полученный код"
                required
              />
            </div>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Проверка...' : 'Подтвердить'}
            </button>
            
            <div className="auth-options">
              <button 
                type="button" 
                className="link-button" 
                onClick={() => setMode(AuthMode.PHONE)}
              >
                Запросить новый код
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage; 