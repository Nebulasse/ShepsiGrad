import React from 'react';
import { authService, SocialAuthProvider } from '../../services/authService';
import './SocialButton.css';

interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'vk';
  label: string;
  icon: string;
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ 
  provider, 
  label, 
  icon, 
  className 
}) => {
  const handleClick = async () => {
    try {
      const authConfig: SocialAuthProvider = { provider };
      
      // Добавляем нужные scopes для разных провайдеров
      if (provider === 'google') {
        authConfig.scopes = ['email', 'profile'];
      } else if (provider === 'facebook') {
        authConfig.scopes = ['email', 'public_profile'];
      } else if (provider === 'vk') {
        authConfig.scopes = ['email'];
      }
      
      await authService.loginWithSocialProvider(authConfig);
    } catch (error) {
      console.error(`Ошибка при авторизации через ${provider}:`, error);
    }
  };

  return (
    <button
      className={`social-button ${provider} ${className || ''}`}
      onClick={handleClick}
      type="button"
    >
      <img src={icon} alt={label} className="social-icon" />
      <span>{label}</span>
    </button>
  );
};

export default SocialButton; 