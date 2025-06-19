import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Типы данных
interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  imageUrl: string;
  rating?: number;
  type?: string;
}

// Временные данные популярных предложений
const POPULAR_PROPERTIES: Property[] = [
  { 
    id: '1', 
    title: 'Апартаменты на берегу моря', 
    price: '5000 ₽/день',
    location: 'ул. Морская, 1',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    rating: 4.8,
    type: 'Апартаменты'
  },
  { 
    id: '2', 
    title: 'Уютная квартира в центре', 
    price: '3500 ₽/день',
    location: 'ул. Тестовая, 15',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
    rating: 4.6,
    type: 'Квартира'
  },
  { 
    id: '3', 
    title: 'Коттедж с бассейном', 
    price: '8000 ₽/день',
    location: 'ул. Горная, 5',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
    rating: 4.9,
    type: 'Коттедж'
  },
  { 
    id: '4', 
    title: 'Гостевой дом в Шепси', 
    price: '4000 ₽/день',
    location: 'ул. Приморская, 22',
    imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=1000&auto=format&fit=crop',
    rating: 4.7,
    type: 'Дом'
  },
];

// Данные категорий
const CATEGORIES = [
  { id: '1', name: 'Квартиры', icon: 'apartment' },
  { id: '2', name: 'Дома', icon: 'home' },
  { id: '3', name: 'Виллы', icon: 'villa' },
  { id: '4', name: 'Отели', icon: 'hotel' },
];

// Получаем размеры экрана
const { width } = Dimensions.get('window');
const propertyCardWidth = width * 0.7;

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToSearch = () => {
    router.push('/search');
  };

  const navigateToPropertyDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => navigateToPropertyDetails(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.propertyInfo}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.propertyLocation}>{item.location}</Text>
        </View>
        <Text style={styles.propertyPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIconContainer}>
        <MaterialIcons name={item.icon as any} size={24} color="#0075FF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="auto" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeTitle}>Привет, Гость!</Text>
              <Text style={styles.welcomeSubtitle}>Найдите идеальное жилье в Шепси</Text>
            </View>
            
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Ionicons name="person" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={navigateToSearch}
          >
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Куда вы хотите поехать?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Категории</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Рекомендуемые</Text>
            <TouchableOpacity onPress={() => router.push('/properties')}>
              <Text style={styles.seeAllText}>Все</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={POPULAR_PROPERTIES}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertyList}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={propertyCardWidth + 15}
          />
        </View>
        
        <View style={styles.specialOfferSection}>
          <Text style={styles.specialOfferTitle}>Специальное предложение</Text>
          <TouchableOpacity style={styles.specialOfferCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=1000&auto=format&fit=crop' }} 
              style={styles.specialOfferImage}
              resizeMode="cover"
            />
            <View style={styles.specialOfferOverlay}>
              <Text style={styles.specialOfferHeading}>Скидка 20%</Text>
              <Text style={styles.specialOfferSubtitle}>На первое бронирование</Text>
              <TouchableOpacity style={styles.specialOfferButton}>
                <Text style={styles.specialOfferButtonText}>Забронировать</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#0075FF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  categoriesSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0075FF',
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 25,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#e6f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  propertyList: {
    paddingVertical: 10,
  },
  propertyCard: {
    width: propertyCardWidth,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  propertyInfo: {
    padding: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0075FF',
  },
  specialOfferSection: {
    marginBottom: 120,
    paddingHorizontal: 20,
  },
  specialOfferTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  specialOfferCard: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  specialOfferImage: {
    width: '100%',
    height: '100%',
  },
  specialOfferOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
  },
  specialOfferHeading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  specialOfferSubtitle: {
    color: '#eee',
    fontSize: 14,
    marginBottom: 10,
  },
  specialOfferButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  specialOfferButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
}); 