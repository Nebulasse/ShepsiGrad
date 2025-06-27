import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Помощь</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Часто задаваемые вопросы</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Как зарегистрироваться в приложении?</Text>
          <Text style={styles.faqAnswer}>
            Для регистрации нажмите кнопку "Зарегистрироваться" на главном экране. Заполните все необходимые поля и следуйте инструкциям.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Что делать, если я забыл пароль?</Text>
          <Text style={styles.faqAnswer}>
            Нажмите на ссылку "Забыли пароль?" на странице входа. Введите email, указанный при регистрации, и мы отправим вам инструкции по восстановлению пароля.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Как добавить объект недвижимости?</Text>
          <Text style={styles.faqAnswer}>
            После входа в систему перейдите в раздел "Мои объекты" и нажмите кнопку "Добавить объект". Заполните информацию о вашем объекте недвижимости и загрузите фотографии.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Как изменить настройки профиля?</Text>
          <Text style={styles.faqAnswer}>
            В главном меню выберите "Профиль", затем нажмите на иконку настроек. Здесь вы можете изменить личную информацию, пароль и настройки уведомлений.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Как связаться с технической поддержкой?</Text>
          <Text style={styles.faqAnswer}>
            Вы можете отправить запрос в техническую поддержку через раздел "Поддержка" в главном меню или написать на email support@shepsigrad.com.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Нужна дополнительная помощь?</Text>
          <Text style={styles.contactText}>
            Свяжитесь с нашей службой поддержки:
          </Text>
          <Text style={styles.contactInfo}>Email: support@shepsigrad.com</Text>
          <Text style={styles.contactInfo}>Телефон: +7 (800) 123-45-67</Text>
          <Text style={styles.contactInfo}>Время работы: Пн-Пт, 9:00 - 18:00</Text>
        </View>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => router.push('/support/new-ticket')}
        >
          <Text style={styles.supportButtonText}>Создать обращение в поддержку</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4D8EFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#E8F1FF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  supportButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 