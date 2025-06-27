import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supportService, SupportTicket } from '../services/supportService';

// Компонент для отображения статуса тикета
const TicketStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return '#4CAF50'; // Зеленый
      case 'in_progress':
        return '#2196F3'; // Синий
      case 'resolved':
        return '#9C27B0'; // Фиолетовый
      case 'closed':
        return '#F44336'; // Красный
      default:
        return '#9E9E9E'; // Серый
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'in_progress':
        return 'В работе';
      case 'resolved':
        return 'Решен';
      case 'closed':
        return 'Закрыт';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
};

// Компонент для отображения элемента списка тикетов
const TicketItem = ({ ticket, onPress }) => {
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.ticketItem} onPress={() => onPress(ticket)}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
        <TicketStatusBadge status={ticket.status} />
      </View>
      
      <Text style={styles.ticketMessage} numberOfLines={2}>{ticket.message}</Text>
      
      <View style={styles.ticketFooter}>
        <Text style={styles.ticketDate}>Создан: {formatDate(ticket.createdAt)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

export default function TicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Загрузка тикетов
  const loadTickets = async (status?: string) => {
    try {
      setIsLoading(true);
      const ticketsData = await supportService.getUserTickets(status);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Ошибка при загрузке тикетов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список обращений. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Первоначальная загрузка тикетов
  useEffect(() => {
    loadTickets();
  }, []);

  // Обработчик обновления списка
  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets(activeFilter || undefined);
  };

  // Обработчик фильтрации тикетов
  const handleFilter = (status: string | null) => {
    setActiveFilter(status);
    loadTickets(status || undefined);
  };

  // Обработчик нажатия на тикет
  const handleTicketPress = (ticket: SupportTicket) => {
    router.push(`/support/ticket/${ticket.id}`);
  };

  // Обработчик создания нового тикета
  const handleCreateTicket = () => {
    router.push('/support/new-ticket');
  };

  // Отображение пустого списка
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbox-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyText}>У вас пока нет обращений</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateTicket}>
        <Text style={styles.createButtonText}>Создать обращение</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Мои обращения' }} />
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === null && styles.activeFilterButton]}
            onPress={() => handleFilter(null)}
          >
            <Text style={[styles.filterText, activeFilter === null && styles.activeFilterText]}>Все</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'open' && styles.activeFilterButton]}
            onPress={() => handleFilter('open')}
          >
            <Text style={[styles.filterText, activeFilter === 'open' && styles.activeFilterText]}>Открытые</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'in_progress' && styles.activeFilterButton]}
            onPress={() => handleFilter('in_progress')}
          >
            <Text style={[styles.filterText, activeFilter === 'in_progress' && styles.activeFilterText]}>В работе</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'resolved' && styles.activeFilterButton]}
            onPress={() => handleFilter('resolved')}
          >
            <Text style={[styles.filterText, activeFilter === 'resolved' && styles.activeFilterText]}>Решенные</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'closed' && styles.activeFilterButton]}
            onPress={() => handleFilter('closed')}
          >
            <Text style={[styles.filterText, activeFilter === 'closed' && styles.activeFilterText]}>Закрытые</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D8EFF" />
          <Text style={styles.loadingText}>Загрузка обращений...</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketItem ticket={item} onPress={handleTicketPress} />}
          contentContainerStyle={tickets.length === 0 ? { flex: 1 } : styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={handleCreateTicket}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  activeFilterButton: {
    backgroundColor: '#4D8EFF',
  },
  filterText: {
    color: '#666666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  ticketMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#4D8EFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4D8EFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 