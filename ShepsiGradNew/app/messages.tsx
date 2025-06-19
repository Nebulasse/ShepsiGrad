import { useEffect } from 'react';
import { router } from 'expo-router';

export default function MessagesRedirect() {
  // Перенаправляем на страницу чатов
  useEffect(() => {
    router.replace('/chat');
  }, []);

  return null;
} 