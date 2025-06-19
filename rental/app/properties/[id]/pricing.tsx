import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { pricingService, PriceSettings, PriceRule } from '../../services/pricingService';
import { propertyService, Property } from '../../services/propertyService';

export default function PricingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [priceSettings, setPriceSettings] = useState<PriceSettings | null>(null);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Загрузка данных
  const loadData = async () => {
    if (!id) {
      setError("Идентификатор объекта не указан");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Загружаем информацию об объекте
      const propertyData = await propertyService.getPropertyById(id);
      setProperty(propertyData);
      
      // Загружаем настройки цен
      const settings = await pricingService.getPriceSettings(id);
      setPriceSettings(settings);
      
      // Загружаем правила ценообразования
      const rules = await pricingService.getPriceRules(id);
      setPriceRules(rules);
    } catch (err) {
      console.error(`Ошибка при загрузке данных для объекта ${id}:`, err);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Отображение загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: "Загрузка..." }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Отображение ошибки
  if (error || !property || !priceSettings) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: "Ошибка" }} />
        <Text style={styles.errorText}>{error || "Объект не найден"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Управление ценами" }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.subtitle}>Управление ценами</Text>
      </View>
      
      <Text>Страница управления ценами находится в разработке</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  }
});