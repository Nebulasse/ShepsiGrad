import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ChatTabRedirect() {
  // Перенаправляем на страницу чатов
  useEffect(() => {
    router.replace('/chat');
  }, []);

  return null;
} 