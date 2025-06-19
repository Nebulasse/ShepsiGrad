import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { propertyService, Property } from './services/propertyService';

export default function PropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка объектов недвижимости
  const loadProperties = async () => {
    try {
      setError(null);
      const data = await propertyService.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Ошибка при загрузке объектов:', err);
      setError('Не удалось загрузить объекты недвижимости');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обновление списка при pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  // Загрузка данных при первом рендере
  useEffect(() => {
    loadProperties();
  }, []);

  // Переход к детальной информации об объекте
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  // Добавление нового объекта
  const handleAddProperty = () => {
    router.push('/properties/add');
  };

  // Форматирование цены
  const formatPrice = (price: number, priceUnit: string) => {
    const unitMap: Record<string, string> = {
      'day': 'день',
      'night': 'ночь',
      'month': 'месяц'
    };
    
    return `${price.toLocaleString()} ₽/${unitMap[priceUnit] || 'день'}`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Объекты недвижимости',
          headerRight: () => (
            <TouchableOpacity onPress={handleAddProperty} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar style="auto" />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProperties}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас пока нет объектов недвижимости</Text>
          <TouchableOpacity style={styles.addPropertyButton} onPress={handleAddProperty}>
            <Text style={styles.addPropertyButtonText}>Добавить объект</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.propertyItem}
              onPress={() => handlePropertyPress(item.id)}
            >
              {item.images && item.images.length > 0 && (
                <Image 
                  source={{ uri: item.images[0] }} 
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{item.title}</Text>
                <Text style={styles.propertyAddress}>{item.address}</Text>
                <Text style={styles.propertyPrice}>
                  {formatPrice(item.price, item.priceUnit)}
                </Text>
                <View style={styles.propertyDetails}>
                  <Text style={styles.propertyDetail}>Комнат: {item.rooms}</Text>
                  <Text style={styles.propertyDetail}>Гостей: {item.maxGuests}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge, 
                    item.status === 'active' ? styles.statusActive : 
                    item.status === 'pending' ? styles.statusPending : 
                    styles.statusInactive
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status === 'active' ? 'Активен' : 
                       item.status === 'pending' ? 'На проверке' : 
                       'Неактивен'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addPropertyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addPropertyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  propertyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyImage: {
    height: 180,
    width: '100%',
  },
  propertyInfo: {
    padding: 15,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
}); 