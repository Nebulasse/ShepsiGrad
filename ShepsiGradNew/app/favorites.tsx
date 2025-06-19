import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Интерфейс для избранного объекта
interface FavoriteProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  imageUrl: string;
}

// Временные данные для отображения
const FAVORITES: FavoriteProperty[] = [
  { 
    id: '1', 
    title: 'Апартаменты на берегу моря', 
    price: '5000 ₽/день',
    location: 'Шепси, 200м от моря',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '3', 
    title: 'Коттедж с бассейном', 
    price: '8000 ₽/день',
    location: 'Шепси, район Верхний',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '5', 
    title: 'Студия с видом на море', 
    price: '3000 ₽/день',
    location: 'Шепси, 100м от моря',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>(FAVORITES);

  const navigateToPropertyDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Избранное',
        headerShown: false
      }} />
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
      </View>
      
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Нет избранных объектов</Text>
          <Text style={styles.emptyText}>Добавьте понравившиеся объекты в избранное, чтобы вернуться к ним позже</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/properties')}
          >
            <Text style={styles.exploreButtonText}>Посмотреть объекты</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.propertyCard}>
              <TouchableOpacity 
                onPress={() => navigateToPropertyDetails(item.id)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              
              <View style={styles.propertyInfo}>
                <TouchableOpacity 
                  onPress={() => navigateToPropertyDetails(item.id)}
                  style={styles.infoContainer}
                >
                  <Text style={styles.propertyTitle}>{item.title}</Text>
                  <Text style={styles.propertyLocation}>{item.location}</Text>
                  <Text style={styles.propertyPrice}>{item.price}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => removeFromFavorites(item.id)}
                >
                  <Ionicons name="heart" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  header: {
    padding: 16,
    marginTop: 50,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Отступ для предотвращения перекрытия контента навигационной панелью
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 180,
  },
  propertyInfo: {
    padding: 16,
    flexDirection: 'row',
  },
  infoContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  favoriteButton: {
    padding: 8,
  },
}); 