import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReviewsList from '../components/property/ReviewsList';
import WriteReviewModal from '../components/property/WriteReviewModal';
import CreateConversationModal from '../components/chat/CreateConversationModal';

// Временная база данных объектов (в будущем будет заменена на API)
const PROPERTIES = {
  '1': {
    id: '1',
    title: 'Апартаменты на берегу моря',
    price: '5000 ₽/день',
    location: 'Шепси, 200м от моря',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    rating: 4.8,
    reviews: 24,
    description: 'Уютные апартаменты с прекрасным видом на море. Расположены в тихом районе, всего в 5 минутах ходьбы от пляжа. В квартире есть все необходимое для комфортного отдыха: кондиционер, Wi-Fi, полностью оборудованная кухня, стиральная машина.',
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Кухня', 'Стиральная машина', 'Парковка'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    hostName: 'Алексей',
    hostRating: 4.9
  },
  '2': {
    id: '2',
    title: 'Уютная квартира в центре',
    price: '3500 ₽/день',
    location: 'Центр Шепси',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    rating: 4.6,
    reviews: 18,
    description: 'Современная квартира в самом центре города. Рядом находятся кафе, рестораны, магазины и основные достопримечательности. Идеальный вариант для пар или небольших семей.',
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Кухня'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
    hostName: 'Елена',
    hostRating: 4.7
  },
  '3': {
    id: '3',
    title: 'Коттедж с бассейном',
    price: '8000 ₽/день',
    location: 'Шепси, район Верхний',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    rating: 4.9,
    reviews: 32,
    description: 'Просторный коттедж с собственным бассейном и зоной барбекю. Идеально подходит для семейного отдыха или компании друзей. Три спальни, две ванные комнаты, просторная гостиная и полностью оборудованная кухня.',
    amenities: ['Бассейн', 'Wi-Fi', 'Кондиционер', 'Барбекю', 'Парковка', 'Стиральная машина', 'Посудомоечная машина'],
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
    hostName: 'Михаил',
    hostRating: 5.0
  },
  '4': {
    id: '4',
    title: 'Гостевой дом в Шепси',
    price: '4000 ₽/день',
    location: 'Шепси, 500м от моря',
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    rating: 4.7,
    reviews: 15,
    description: 'Комфортабельный гостевой дом в тихом районе Шепси. До моря всего 7 минут пешком. На территории есть мангал, зона отдыха и парковка для автомобиля.',
    amenities: ['Wi-Fi', 'Кондиционер', 'Барбекю', 'Парковка', 'Кухня'],
    imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=1000&auto=format&fit=crop',
    hostName: 'Ольга',
    hostRating: 4.8
  },
  '5': {
    id: '5',
    title: 'Студия с видом на море',
    price: '3000 ₽/день',
    location: 'Шепси, 100м от моря',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    rating: 4.5,
    reviews: 12,
    description: 'Компактная, но функциональная студия с прекрасным видом на море. Идеальный вариант для пары. В шаговой доступности находятся пляж, кафе, магазины.',
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Кухня'],
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop',
    hostName: 'Сергей',
    hostRating: 4.6
  }
};

// Получаем размеры экрана
const { width } = Dimensions.get('window');

export default function PropertyDetails() {
  // Получаем ID объекта из параметров URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  // const insets = useSafeAreaInsets();
  
  // Состояние для модального окна написания отзыва
  const [isWriteReviewModalVisible, setIsWriteReviewModalVisible] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Получаем данные объекта (в реальном приложении здесь будет API-запрос)
  const property = PROPERTIES[id as keyof typeof PROPERTIES];
  
  // Получаем владельца объекта для чата
  const propertyHost = {
    id: 'host1', // В реальном приложении это будет ID из базы данных
    name: 'Владелец', // В реальном приложении это будет имя владельца
  };

  const handleBooking = () => {
    router.push(`/property/${id}/booking`);
  };

  const handleBack = () => {
    router.back();
  };
  
  const handleWriteReview = () => {
    setIsWriteReviewModalVisible(true);
  };
  
  const handleReviewSuccess = () => {
    // В реальном приложении здесь будет обновление списка отзывов
    // через API запрос или обновление состояния
    console.log('Отзыв успешно отправлен');
  };
  
  const handleContactHost = () => {
    setShowContactModal(true);
  };
  
  if (!property) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Объект не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: property.imageUrl }} 
          style={styles.headerImage} 
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.roundButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.roundButton}>
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.contentScroll}>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{property.rating}</Text>
              <Text style={styles.reviewsText}>({property.reviews} отзывов)</Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.location}>{property.location}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.featuresContainer}>
            <FeatureItem icon="bed-outline" label={`${property.bedrooms} спальни`} />
            <FeatureItem icon="water-outline" label={`${property.bathrooms} ванные`} />
            <FeatureItem icon="resize-outline" label={`${property.area} м²`} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.hostContainer}>
            <View style={styles.hostHeader}>
              <Text style={styles.sectionTitle}>Хозяин</Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Связаться</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.hostInfo}>
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>{property.hostName.charAt(0)}</Text>
              </View>
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>{property.hostName}</Text>
                <View style={styles.hostRatingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.hostRatingText}>{property.hostRating}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Удобства</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons 
                    name={getAmenityIcon(amenity)} 
                    size={16} 
                    color="#0075FF" 
                    style={styles.amenityIcon}
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Секция отзывов */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Отзывы</Text>
              <TouchableOpacity 
                style={styles.allReviewsButton}
                onPress={() => router.push(`/property/${property.id}/reviews`)}
              >
                <Text style={styles.allReviewsText}>Все отзывы</Text>
                <Ionicons name="chevron-forward" size={16} color="#0075FF" />
              </TouchableOpacity>
            </View>
            <ReviewsList 
              propertyId={property.id} 
              onWriteReview={handleWriteReview} 
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{property.price}</Text>
          <Text style={styles.priceSubtext}>без комиссии</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              if (property.id) {
                router.push(`/property/${property.id}/booking`);
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Забронировать</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleContactHost}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0078FF" />
            <Text style={styles.secondaryButtonText}>Связаться с владельцем</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Модальное окно для написания отзыва */}
      <WriteReviewModal
        visible={isWriteReviewModalVisible}
        onClose={() => setIsWriteReviewModalVisible(false)}
        onSuccess={handleReviewSuccess}
        propertyId={property.id}
        userId="current-user-id" // В реальном приложении ID текущего пользователя
        userName="Гость" // В реальном приложении имя текущего пользователя
      />
      
      {/* Модальное окно для отправки сообщения */}
      <CreateConversationModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        propertyId={property?.id}
        propertyTitle={property?.title}
        hostId={propertyHost.id}
        hostName={propertyHost.name}
      />
    </View>
  );
}

// Компонент для отображения особенностей объекта
function FeatureItem({ icon, label }: { icon: string, label: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={22} color="#0075FF" />
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

// Функция для определения иконки для удобства
function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    'Wi-Fi': 'wifi-outline',
    'Кондиционер': 'snow-outline',
    'Телевизор': 'tv-outline',
    'Кухня': 'restaurant-outline',
    'Стиральная машина': 'water-outline',
    'Парковка': 'car-outline',
    'Бассейн': 'water-outline',
    'Барбекю': 'flame-outline',
    'Посудомоечная машина': 'water-outline'
  };
  
  return icons[amenity] || 'checkmark-circle-outline';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentScroll: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80, // Отступ для предотвращения перекрытия контента нижней навигацией
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  hostContainer: {
    marginBottom: 10,
  },
  hostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0075FF',
  },
  contactButtonText: {
    fontSize: 12,
    color: '#0075FF',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0075FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hostAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hostRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostRatingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  section: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityIcon: {
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#555',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    paddingBottom: 24, // insets.bottom + 16 || 24,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#666',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 24, // insets.bottom + 16 || 24,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#0078FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#F0F8FF',
  },
  secondaryButtonText: {
    color: '#0078FF',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
  reviewsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  allReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allReviewsText: {
    fontSize: 14,
    color: '#0075FF',
    marginRight: 4,
  },
}); 