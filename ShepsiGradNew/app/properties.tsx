import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';

// Временные данные для отображения
const PROPERTIES = [
  { 
    id: '1', 
    title: 'Апартаменты на берегу моря', 
    price: '5000 ₽/день',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '2', 
    title: 'Уютная квартира в центре', 
    price: '3500 ₽/день',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '3', 
    title: 'Коттедж с бассейном', 
    price: '8000 ₽/день',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '4', 
    title: 'Гостевой дом в Шепси', 
    price: '4000 ₽/день',
    imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: '5', 
    title: 'Студия с видом на море', 
    price: '3000 ₽/день',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop'
  },
];

export default function PropertiesScreen() {
  const router = useRouter();

  const navigateToPropertyDetails = (id: string) => {
    router.push(`/property/${id}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Объекты недвижимости' }} />
      <StatusBar style="auto" />
      
      <FlatList
        data={PROPERTIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.propertyItem}
            onPress={() => navigateToPropertyDetails(item.id)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{item.title}</Text>
              <Text style={styles.propertyPrice}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  propertyItem: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
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
    padding: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    color: '#007AFF',
  },
}); 