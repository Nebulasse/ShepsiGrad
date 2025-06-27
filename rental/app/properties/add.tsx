import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { propertyService } from '../services/propertyService';

// Типы для объекта недвижимости
interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string[];
  rules: string[];
  images: string[];
  isActive: boolean;
  instantBooking: boolean;
}

// Типы для удобств
interface AmenityOption {
  id: string;
  name: string;
  icon: string;
}

// Типы для правил
interface RuleOption {
  id: string;
  name: string;
  icon: string;
}

// Компонент страницы добавления объекта
export default function AddPropertyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Состояние формы
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    amenities: [],
    rules: [],
    images: [],
    isActive: true,
    instantBooking: false,
  });
  
  // Опции для типов недвижимости
  const propertyTypes = [
    { id: 'apartment', name: 'Квартира', icon: 'apartment' },
    { id: 'house', name: 'Дом', icon: 'home' },
    { id: 'villa', name: 'Вилла', icon: 'villa' },
    { id: 'hotel', name: 'Отель', icon: 'hotel' },
    { id: 'hostel', name: 'Хостел', icon: 'business' },
  ];
  
  // Опции для удобств
  const amenityOptions: AmenityOption[] = [
    { id: 'wifi', name: 'Wi-Fi', icon: 'wifi' },
    { id: 'parking', name: 'Парковка', icon: 'car' },
    { id: 'pool', name: 'Бассейн', icon: 'water' },
    { id: 'aircon', name: 'Кондиционер', icon: 'snow' },
    { id: 'tv', name: 'Телевизор', icon: 'tv' },
    { id: 'kitchen', name: 'Кухня', icon: 'restaurant' },
    { id: 'washer', name: 'Стиральная машина', icon: 'water-outline' },
    { id: 'gym', name: 'Спортзал', icon: 'barbell' },
    { id: 'elevator', name: 'Лифт', icon: 'arrow-up' },
    { id: 'heating', name: 'Отопление', icon: 'thermometer' },
  ];
  
  // Опции для правил
  const ruleOptions: RuleOption[] = [
    { id: 'no_smoking', name: 'Не курить', icon: 'smoking-ban' },
    { id: 'no_pets', name: 'Без животных', icon: 'paw' },
    { id: 'no_parties', name: 'Без вечеринок', icon: 'glass-cheers' },
    { id: 'quiet_hours', name: 'Тихие часы', icon: 'volume-mute' },
    { id: 'check_in_time', name: 'Заезд после 14:00', icon: 'clock' },
    { id: 'check_out_time', name: 'Выезд до 12:00', icon: 'clock' },
  ];
  
  // Обработчик изменения полей формы
  const handleChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Обработчик переключения удобств
  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => {
      if (prev.amenities.includes(amenityId)) {
        return { ...prev, amenities: prev.amenities.filter(id => id !== amenityId) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenityId] };
      }
    });
  };
  
  // Обработчик переключения правил
  const toggleRule = (ruleId: string) => {
    setFormData(prev => {
      if (prev.rules.includes(ruleId)) {
        return { ...prev, rules: prev.rules.filter(id => id !== ruleId) };
      } else {
        return { ...prev, rules: [...prev.rules, ruleId] };
      }
    });
  };
  
  // Обработчик выбора изображений
  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 10)
        }));
      }
    } catch (error) {
      console.error('Ошибка при выборе изображений:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображения');
    }
  };
  
  // Удаление изображения
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Переход к следующему шагу
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Переход к предыдущему шагу
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Валидация текущего шага
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert('Ошибка', 'Введите название объекта');
          return false;
        }
        if (!formData.description.trim()) {
          Alert.alert('Ошибка', 'Введите описание объекта');
          return false;
        }
        if (!formData.price.trim() || isNaN(Number(formData.price))) {
          Alert.alert('Ошибка', 'Введите корректную цену');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.address.trim()) {
          Alert.alert('Ошибка', 'Введите адрес объекта');
          return false;
        }
        if (!formData.city.trim()) {
          Alert.alert('Ошибка', 'Введите город');
          return false;
        }
        if (!formData.area.trim() || isNaN(Number(formData.area))) {
          Alert.alert('Ошибка', 'Введите корректную площадь');
          return false;
        }
        return true;
        
      case 3:
        if (formData.amenities.length === 0) {
          Alert.alert('Предупреждение', 'Вы не выбрали ни одного удобства. Продолжить?', [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Продолжить', onPress: () => goToNextStep() }
          ]);
          return false;
        }
        return true;
        
      case 4:
        if (formData.images.length === 0) {
          Alert.alert('Предупреждение', 'Вы не добавили ни одного изображения. Объекты с фотографиями привлекают больше внимания. Продолжить?', [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Продолжить', onPress: () => handleSubmit() }
          ]);
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };
  
  // Обработчик нажатия на кнопку "Далее"
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        goToNextStep();
      } else {
        handleSubmit();
      }
    }
  };
  
  // Отправка формы
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Подготовка данных для отправки
      const propertyData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
      };
      
      // Отправка данных на сервер
      const response = await propertyService.createProperty(propertyData);
      
      setSubmitting(false);
      
      if (response && response.id) {
        Alert.alert(
          'Успешно',
          'Объект недвижимости успешно добавлен',
          [
            {
              text: 'OK',
              onPress: () => router.push(`/properties/${response.id}`)
            }
          ]
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось добавить объект недвижимости');
      }
    } catch (error) {
      setSubmitting(false);
      console.error('Ошибка при отправке формы:', error);
      Alert.alert('Ошибка', 'Не удалось добавить объект недвижимости');
    }
  };
  
  // Рендер шага 1: Основная информация
  const renderStep1 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Основная информация</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Название объекта *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            placeholder="Например: Уютная квартира в центре"
            maxLength={100}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Описание *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Опишите ваш объект..."
            multiline
            numberOfLines={5}
            maxLength={2000}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Цена за ночь (₽) *</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
            placeholder="Например: 5000"
            keyboardType="number-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Тип объекта *</Text>
          <View style={styles.propertyTypesContainer}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.propertyTypeButton,
                  formData.type === type.id && styles.propertyTypeButtonActive
                ]}
                onPress={() => handleChange('type', type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={formData.type === type.id ? '#fff' : '#333'}
                />
                <Text
                  style={[
                    styles.propertyTypeText,
                    formData.type === type.id && styles.propertyTypeTextActive
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };
  
  // Рендер шага 2: Детали и расположение
  const renderStep2 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Детали и расположение</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Адрес *</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            placeholder="Улица, номер дома, квартира"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Город *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => handleChange('city', text)}
            placeholder="Например: Шепси"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Количество спален</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const value = Number(formData.bedrooms);
                if (value > 1) {
                  handleChange('bedrooms', String(value - 1));
                }
              }}
            >
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.counterValue}>{formData.bedrooms}</Text>
            
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const value = Number(formData.bedrooms);
                handleChange('bedrooms', String(value + 1));
              }}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Количество ванных комнат</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const value = Number(formData.bathrooms);
                if (value > 1) {
                  handleChange('bathrooms', String(value - 1));
                }
              }}
            >
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.counterValue}>{formData.bathrooms}</Text>
            
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                const value = Number(formData.bathrooms);
                handleChange('bathrooms', String(value + 1));
              }}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Площадь (м²) *</Text>
          <TextInput
            style={styles.input}
            value={formData.area}
            onChangeText={(text) => handleChange('area', text)}
            placeholder="Например: 60"
            keyboardType="number-pad"
          />
        </View>
      </View>
    );
  };
  
  // Рендер шага 3: Удобства и правила
  const renderStep3 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Удобства и правила</Text>
        
        <Text style={styles.sectionTitle}>Удобства</Text>
        <View style={styles.amenitiesContainer}>
          {amenityOptions.map((amenity) => (
            <TouchableOpacity
              key={amenity.id}
              style={[
                styles.amenityButton,
                formData.amenities.includes(amenity.id) && styles.amenityButtonActive
              ]}
              onPress={() => toggleAmenity(amenity.id)}
            >
              <Ionicons
                name={amenity.icon as any}
                size={22}
                color={formData.amenities.includes(amenity.id) ? '#fff' : '#333'}
              />
              <Text
                style={[
                  styles.amenityText,
                  formData.amenities.includes(amenity.id) && styles.amenityTextActive
                ]}
              >
                {amenity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Правила проживания</Text>
        <View style={styles.rulesContainer}>
          {ruleOptions.map((rule) => (
            <TouchableOpacity
              key={rule.id}
              style={[
                styles.ruleButton,
                formData.rules.includes(rule.id) && styles.ruleButtonActive
              ]}
              onPress={() => toggleRule(rule.id)}
            >
              <FontAwesome5
                name={rule.icon}
                size={16}
                color={formData.rules.includes(rule.id) ? '#fff' : '#333'}
              />
              <Text
                style={[
                  styles.ruleText,
                  formData.rules.includes(rule.id) && styles.ruleTextActive
                ]}
              >
                {rule.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Мгновенное бронирование</Text>
            <Switch
              value={formData.instantBooking}
              onValueChange={(value) => handleChange('instantBooking', value)}
              trackColor={{ false: '#d1d1d1', true: '#4D8EFF' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Активный объект</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => handleChange('isActive', value)}
              trackColor={{ false: '#d1d1d1', true: '#4D8EFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>
    );
  };
  
  // Рендер шага 4: Фотографии
  const renderStep4 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Фотографии</Text>
        
        <Text style={styles.helperText}>
          Добавьте до 10 фотографий вашего объекта. Качественные фотографии увеличивают шансы на бронирование.
        </Text>
        
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handlePickImages}
        >
          <Ionicons name="images-outline" size={32} color="#4D8EFF" />
          <Text style={styles.imagePickerText}>Выбрать фотографии</Text>
        </TouchableOpacity>
        
        {formData.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  // Рендер текущего шага
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Добавление объекта',
          headerStyle: { backgroundColor: '#4D8EFF' },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              currentStep > index && styles.progressStepCompleted,
              currentStep === index + 1 && styles.progressStepActive
            ]}
          />
        ))}
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderCurrentStep()}
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPrevStep}
            disabled={submitting}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.disabledButton]}
          onPress={handleNext}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Добавить объект' : 'Далее'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e1e1e1',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepCompleted: {
    backgroundColor: '#4D8EFF',
  },
  progressStepActive: {
    backgroundColor: '#4D8EFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  propertyTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  propertyTypeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    margin: '1.5%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  propertyTypeButtonActive: {
    backgroundColor: '#4D8EFF',
    borderColor: '#4D8EFF',
  },
  propertyTypeText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  propertyTypeTextActive: {
    color: '#fff',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  counterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    margin: '1%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  amenityButtonActive: {
    backgroundColor: '#4D8EFF',
    borderColor: '#4D8EFF',
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  amenityTextActive: {
    color: '#fff',
  },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ruleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    margin: '1%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  ruleButtonActive: {
    backgroundColor: '#4D8EFF',
    borderColor: '#4D8EFF',
  },
  ruleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  ruleTextActive: {
    color: '#fff',
  },
  switchContainer: {
    marginTop: 20,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4D8EFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#4D8EFF',
    marginLeft: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  imageWrapper: {
    width: '48%',
    aspectRatio: 16/9,
    margin: 5,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  backButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 