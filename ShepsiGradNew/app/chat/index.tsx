import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import chatService from '../services/chatService';
import { Conversation } from '../types/Chat';
import ConversationItem from '../components/chat/ConversationItem';

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем диалоги при монтировании компонента
  useEffect(() => {
    loadConversations();
  }, []);

  // Функция загрузки диалогов
  const loadConversations = async () => {
    try {
      setError(null);
      const data = await chatService.getUserConversations();
      setConversations(data);
    } catch (err) {
      console.error('Ошибка при загрузке диалогов:', err);
      setError('Не удалось загрузить диалоги. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обработчик обновления списка
  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // Рендер пустого списка
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Нет сообщений</Text>
        <Text style={styles.emptyText}>
          У вас пока нет диалогов. Начните переписку с владельцем объекта недвижимости.
        </Text>
      </View>
    );
  };

  // Рендер элемента списка
  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem conversation={item} />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Сообщения',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0078FF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : styles.listContainer
          }
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0078FF']}
              tintColor="#0078FF"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 