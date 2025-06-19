import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { propertyService, Property } from '../services/propertyService';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Загрузка данных об объекте
  const loadProperty = async () => {
    if (!id) {
      setError('Идентификатор объекта не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await propertyService.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      console.error(`Ошибка при загрузке объекта ${id}:`, err);
      setError('Не удалось загрузить информацию об объекте');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  // Переход к редактированию объекта
  const handleEditProperty = () => {
    router.push(`/properties/${id}/edit`);
  };

  // Переход к управлению ценами
  const handleManagePricing = () => {
    router.push(`/properties/${id}/pricing`);
  };

  // Переход к календарю бронирований
  const handleViewCalendar = () => {
    router.push(`/properties/${id}/calendar`);
  };

  // Удаление объекта
  const handleDeleteProperty = () => {
    Alert.alert(
      'Удаление объекта',
      'Вы уверены, что хотите удалить этот объект? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(id);
              Alert.alert(
                'Успех',
                'Объект успешно удален',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (err) {
              console.error(`Ошибка при удалении объекта ${id}:`, err);
              Alert.alert('Ошибка', 'Не удалось удалить объект');
            }
          }
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Загрузка...' }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Ошибка' }} />
        <Text style={styles.errorText}>{error || 'Объект не найден'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProperty}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: property.title,
          headerRight: () => (
            <TouchableOpacity onPress={handleEditProperty} style={styles.editButton}>
              <Text style={styles.editButtonText}>Изменить</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Галерея изображений */}
      <View style={styles.imageContainer}>
        {property.images && property.images.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIndex(slideIndex);
              }}
            >
              {property.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {property.images.length > 1 && (
              <View style={styles.pagination}>
                {property.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>Нет изображений</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Статус объекта */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            property.status === 'active' ? styles.statusActive : 
            property.status === 'pending' ? styles.statusPending : 
            styles.statusInactive
          ]}>
            <Text style={styles.statusText}>
              {property.status === 'active' ? 'Активен' : 
               property.status === 'pending' ? 'На проверке' : 
               'Неактивен'}
            </Text>
          </View>
        </View>

        {/* Основная информация */}
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.address}>{property.address}</Text>
        <Text style={styles.price}>{formatPrice(property.price, property.priceUnit)}</Text>

        {/* Характеристики */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureValue}>{property.rooms}</Text>
            <Text style={styles.featureLabel}>Комнат</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureValue}>{property.beds}</Text>
            <Text style={styles.featureLabel}>Спальных мест</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureValue}>{property.bathrooms}</Text>
            <Text style={styles.featureLabel}>Ванных</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureValue}>{property.maxGuests}</Text>
            <Text style={styles.featureLabel}>Гостей</Text>
          </View>
        </View>

        {/* Описание */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Удобства */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Удобства</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Кнопки управления */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.calendarButton]} 
            onPress={handleViewCalendar}
          >
            <Text style={styles.actionButtonText}>Календарь бронирований</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.pricingButton]} 
            onPress={handleManagePricing}
          >
            <Text style={styles.actionButtonText}>Управление ценами</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={handleDeleteProperty}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Удалить объект</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width,
    height: 250,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 3,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  noImageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 10,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarButton: {
    backgroundColor: '#007AFF',
  },
  pricingButton: {
    backgroundColor: '#5856D6',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 