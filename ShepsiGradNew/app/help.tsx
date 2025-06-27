import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from './services/api';

// Компонент для секции FAQ
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#4D8EFF" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <Text style={styles.faqAnswerText}>{answer}</Text>
      )}
    </View>
  );
};

export default function HelpScreen() {
  const router = useRouter();
  const [supportMessage, setSupportMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Часто задаваемые вопросы
  const faqItems = [
    {
      question: 'Как забронировать жилье?',
      answer: 'Выберите интересующий вас объект недвижимости, перейдите на его страницу и нажмите кнопку "Забронировать". Выберите даты заезда и выезда, укажите количество гостей и подтвердите бронирование.'
    },
    {
      question: 'Как отменить бронирование?',
      answer: 'Перейдите в раздел "Мои бронирования" в профиле, найдите нужное бронирование и нажмите кнопку "Отменить". Обратите внимание, что в зависимости от условий бронирования может взиматься комиссия за отмену.'
    },
    {
      question: 'Как связаться с владельцем жилья?',
      answer: 'После подтверждения бронирования вы можете общаться с владельцем через встроенный чат. Перейдите в раздел "Сообщения" и выберите соответствующий диалог.'
    },
    {
      question: 'Как оставить отзыв?',
      answer: 'После завершения проживания вы можете оставить отзыв о жилье. Перейдите в раздел "Мои бронирования", найдите завершенное бронирование и нажмите кнопку "Оставить отзыв".'
    },
    {
      question: 'Как добавить объект в избранное?',
      answer: 'На странице объекта недвижимости нажмите на иконку сердечка. Все избранные объекты доступны в разделе "Избранное" в вашем профиле.'
    }
  ];

  // Отправка сообщения в поддержку
  const sendSupportMessage = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите сообщение');
      return;
    }

    setSending(true);
    try {
      await api.post('/support/message', { message: supportMessage });
      Alert.alert('Успех', 'Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
      setSupportMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
    } finally {
      setSending(false);
    }
  };

  // Открытие ссылки
  const openLink = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('Ошибка при открытии ссылки:', err);
      Alert.alert('Ошибка', 'Не удалось открыть ссылку');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Помощь' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Центр помощи</Text>
        <Text style={styles.subtitle}>Ответы на часто задаваемые вопросы и поддержка</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Часто задаваемые вопросы</Text>
        
        {faqItems.map((item, index) => (
          <FAQItem 
            key={index} 
            question={item.question} 
            answer={item.answer} 
          />
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Связаться с поддержкой</Text>
        
        <TextInput
          style={styles.messageInput}
          value={supportMessage}
          onChangeText={setSupportMessage}
          placeholder="Опишите вашу проблему или вопрос..."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendSupportMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Отправить сообщение</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Другие способы связи</Text>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('tel:+78001234567')}
        >
          <Ionicons name="call-outline" size={24} color="#4D8EFF" />
          <Text style={styles.contactText}>+7 (800) 123-45-67</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('mailto:support@shepsigrad.com')}
        >
          <Ionicons name="mail-outline" size={24} color="#4D8EFF" />
          <Text style={styles.contactText}>support@shepsigrad.com</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => openLink('https://shepsigrad.com/support')}
        >
          <Ionicons name="globe-outline" size={24} color="#4D8EFF" />
          <Text style={styles.contactText}>shepsigrad.com/support</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Полезные ссылки</Text>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => openLink('https://shepsigrad.com/terms')}
        >
          <Text style={styles.linkText}>Условия использования</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => openLink('https://shepsigrad.com/privacy')}
        >
          <Text style={styles.linkText}>Политика конфиденциальности</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => openLink('https://shepsigrad.com/rules')}
        >
          <Text style={styles.linkText}>Правила бронирования</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => openLink('https://shepsigrad.com/about')}
        >
          <Text style={styles.linkText}>О нас</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Версия приложения: 1.0.0
        </Text>
        <Text style={styles.footerText}>
          © 2023 ShepsiGrad. Все права защищены.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 10,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 8,
    lineHeight: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
}); 