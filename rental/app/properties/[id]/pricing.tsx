import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { propertyService } from '../../services/propertyService';
import { pricingService } from '../../services/pricingService';
import { Ionicons } from '@expo/vector-icons';

type PricingForm = {
  basePrice: string;
  weekendPrice: string;
  weeklyDiscount: string;
  monthlyDiscount: string;
  minStay: string;
  maxStay: string;
  cleaningFee: string;
  enableDynamicPricing: boolean;
  seasonalRules: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    priceMultiplier: string;
  }[];
};

export default function PricingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState<PricingForm>({
    basePrice: '',
    weekendPrice: '',
    weeklyDiscount: '',
    monthlyDiscount: '',
    minStay: '',
    maxStay: '',
    cleaningFee: '',
    enableDynamicPricing: false,
    seasonalRules: []
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем информацию об объекте
        const propertyData = await propertyService.getPropertyById(id);
        setProperty(propertyData);
        
        // Загружаем настройки цен
        const priceSettings = await pricingService.getPriceSettings(id);
        const priceRules = await pricingService.getPriceRules(id);
        
        // Заполняем форму данными
        setForm({
          basePrice: priceSettings.basePrice?.toString() || '',
          weekendPrice: '', // Нет в API, нужно добавить или получать из правил
          weeklyDiscount: priceSettings.discounts?.weekly?.toString() || '',
          monthlyDiscount: priceSettings.discounts?.monthly?.toString() || '',
          minStay: '', // Нет в API, нужно добавить
          maxStay: '', // Нет в API, нужно добавить
          cleaningFee: priceSettings.cleaningFee?.toString() || '',
          enableDynamicPricing: false, // Нет в API, нужно добавить
          seasonalRules: priceRules
            .filter(rule => rule.type === 'seasonal')
            .map(rule => ({
              id: rule.id,
              name: rule.name,
              startDate: rule.startDate,
              endDate: rule.endDate,
              priceMultiplier: rule.priceModifier.toString()
            }))
        });
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить настройки цен');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Обработка изменения полей формы
  const handleChange = (field: keyof PricingForm, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработка изменения полей сезонного правила
  const handleSeasonalRuleChange = (index: number, field: string, value: string) => {
    setForm(prev => {
      const updatedRules = [...prev.seasonalRules];
      updatedRules[index] = {
        ...updatedRules[index],
        [field]: value
      };
      return {
        ...prev,
        seasonalRules: updatedRules
      };
    });
  };

  // Добавление нового сезонного правила
  const addSeasonalRule = () => {
    setForm(prev => ({
      ...prev,
      seasonalRules: [
        ...prev.seasonalRules,
        {
          id: `new-${Date.now()}`,
          name: '',
          startDate: '',
          endDate: '',
          priceMultiplier: '1.0'
        }
      ]
    }));
  };

  // Удаление сезонного правила
  const removeSeasonalRule = (index: number) => {
    setForm(prev => {
      const updatedRules = [...prev.seasonalRules];
      updatedRules.splice(index, 1);
      return {
        ...prev,
        seasonalRules: updatedRules
      };
    });
  };

  // Сохранение настроек цен
  const handleSave = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Валидация формы
      if (!form.basePrice) {
        Alert.alert('Ошибка', 'Базовая цена обязательна');
        return;
      }
      
      // Подготавливаем данные для отправки
      const priceSettings = {
        basePrice: parseFloat(form.basePrice),
        cleaningFee: form.cleaningFee ? parseFloat(form.cleaningFee) : 0,
        discounts: {
          weekly: form.weeklyDiscount ? parseFloat(form.weeklyDiscount) : 0,
          monthly: form.monthlyDiscount ? parseFloat(form.monthlyDiscount) : 0,
          earlyBird: 0 // Не используется в форме, но требуется в API
        }
      };
      
      // Отправляем обновленные настройки цен
      await pricingService.updatePriceSettings(id, priceSettings);
      
      // Обрабатываем сезонные правила
      for (const rule of form.seasonalRules) {
        const ruleData = {
          name: rule.name,
          startDate: rule.startDate,
          endDate: rule.endDate,
          priceModifier: parseFloat(rule.priceMultiplier),
          isActive: true,
          priority: 1,
          type: 'seasonal' as const
        };
        
        if (rule.id.startsWith('new-')) {
          // Создаем новое правило
          await pricingService.createPriceRule(id, ruleData);
        } else {
          // Обновляем существующее правило
          await pricingService.updatePriceRule(id, rule.id, ruleData);
        }
      }
      
      Alert.alert('Успешно', 'Настройки цен сохранены');
    } catch (err) {
      console.error('Ошибка при сохранении настроек цен:', err);
      setError('Не удалось сохранить настройки цен');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace(`/properties/${id}/pricing`)}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Управление ценами',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push(`/properties/${id}`)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Информация</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property?.title}</Text>
          <Text style={styles.propertyAddress}>{property?.address}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Базовые цены</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Базовая цена за ночь (₽)</Text>
            <TextInput
              style={styles.input}
              value={form.basePrice}
              onChangeText={(value) => handleChange('basePrice', value)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Цена в выходные дни (₽)</Text>
            <TextInput
              style={styles.input}
              value={form.weekendPrice}
              onChangeText={(value) => handleChange('weekendPrice', value)}
              keyboardType="numeric"
              placeholder="0"
            />
            <Text style={styles.helperText}>Оставьте пустым, чтобы использовать базовую цену</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Плата за уборку (₽)</Text>
            <TextInput
              style={styles.input}
              value={form.cleaningFee}
              onChangeText={(value) => handleChange('cleaningFee', value)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Скидки</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Скидка за неделю (%)</Text>
            <TextInput
              style={styles.input}
              value={form.weeklyDiscount}
              onChangeText={(value) => handleChange('weeklyDiscount', value)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Скидка за месяц (%)</Text>
            <TextInput
              style={styles.input}
              value={form.monthlyDiscount}
              onChangeText={(value) => handleChange('monthlyDiscount', value)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Правила бронирования</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Минимальное количество ночей</Text>
            <TextInput
              style={styles.input}
              value={form.minStay}
              onChangeText={(value) => handleChange('minStay', value)}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Максимальное количество ночей</Text>
            <TextInput
              style={styles.input}
              value={form.maxStay}
              onChangeText={(value) => handleChange('maxStay', value)}
              keyboardType="numeric"
              placeholder="30"
            />
            <Text style={styles.helperText}>Оставьте пустым, если нет ограничения</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <Text style={styles.sectionTitle}>Динамическое ценообразование</Text>
            <Switch
              value={form.enableDynamicPricing}
              onValueChange={(value) => handleChange('enableDynamicPricing', value)}
              trackColor={{ false: '#E5E5EA', true: '#4CD964' }}
            />
          </View>
          
          <Text style={styles.helperText}>
            Включите, чтобы автоматически корректировать цены в зависимости от спроса и сезона
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сезонные правила</Text>
          
          {form.seasonalRules.map((rule, index) => (
            <View key={rule.id} style={styles.seasonalRule}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Название сезона</Text>
                <TextInput
                  style={styles.input}
                  value={rule.name}
                  onChangeText={(value) => handleSeasonalRuleChange(index, 'name', value)}
                  placeholder="Например: Высокий сезон"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Дата начала</Text>
                  <TextInput
                    style={styles.input}
                    value={rule.startDate}
                    onChangeText={(value) => handleSeasonalRuleChange(index, 'startDate', value)}
                    placeholder="ГГГГ-ММ-ДД"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Дата окончания</Text>
                  <TextInput
                    style={styles.input}
                    value={rule.endDate}
                    onChangeText={(value) => handleSeasonalRuleChange(index, 'endDate', value)}
                    placeholder="ГГГГ-ММ-ДД"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Множитель цены</Text>
                <TextInput
                  style={styles.input}
                  value={rule.priceMultiplier}
                  onChangeText={(value) => handleSeasonalRuleChange(index, 'priceMultiplier', value)}
                  keyboardType="numeric"
                  placeholder="1.0"
                />
                <Text style={styles.helperText}>
                  1.0 = базовая цена, 1.5 = +50% к базовой цене, 0.8 = -20% от базовой цены
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeSeasonalRule(index)}
              >
                <Text style={styles.removeButtonText}>Удалить правило</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={addSeasonalRule}
          >
            <Text style={styles.addButtonText}>+ Добавить сезонное правило</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  propertyInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonalRule: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});