import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { propertyService, PropertyFormData } from '../services/propertyService';

// Схема валидации формы
const PropertySchema = Yup.object().shape({
  title: Yup.string()
    .required('Название обязательно')
    .min(5, 'Название должно быть не менее 5 символов'),
  description: Yup.string()
    .required('Описание обязательно')
    .min(20, 'Описание должно быть не менее 20 символов'),
  address: Yup.string()
    .required('Адрес обязателен'),
  price: Yup.number()
    .required('Цена обязательна')
    .positive('Цена должна быть положительной'),
  priceUnit: Yup.string()
    .required('Единица измерения цены обязательна')
    .oneOf(['day', 'night', 'month'], 'Некорректная единица измерения'),
  rooms: Yup.number()
    .required('Количество комнат обязательно')
    .min(1, 'Должна быть хотя бы одна комната')
    .integer('Количество комнат должно быть целым числом'),
  beds: Yup.number()
    .required('Количество спальных мест обязательно')
    .min(1, 'Должно быть хотя бы одно спальное место')
    .integer('Количество спальных мест должно быть целым числом'),
  bathrooms: Yup.number()
    .required('Количество ванных комнат обязательно')
    .min(1, 'Должна быть хотя бы одна ванная комната')
    .integer('Количество ванных комнат должно быть целым числом'),
  maxGuests: Yup.number()
    .required('Максимальное количество гостей обязательно')
    .min(1, 'Должен быть хотя бы один гость')
    .integer('Количество гостей должно быть целым числом'),
});

// Начальные значения формы
const initialValues: PropertyFormData = {
  title: '',
  description: '',
  address: '',
  price: 0,
  priceUnit: 'day',
  rooms: 1,
  beds: 1,
  bathrooms: 1,
  maxGuests: 1,
  amenities: [],
};

// Список удобств
const amenitiesList = [
  'Wi-Fi',
  'Кондиционер',
  'Отопление',
  'Кухня',
  'Стиральная машина',
  'Телевизор',
  'Утюг',
  'Фен',
  'Парковка',
  'Бассейн',
];

export default function AddPropertyScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Выбор изображений из галереи
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedImages]);
    }
  };

  // Удаление изображения
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Отправка формы
  const handleSubmit = async (values: PropertyFormData) => {
    if (images.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы одно изображение объекта');
      return;
    }

    setIsSubmitting(true);

    try {
      // Создаем объект недвижимости
      const property = await propertyService.createProperty(values);
      
      // Загружаем изображения
      if (property && property.id) {
        const formData = new FormData();
        
        images.forEach((uri, index) => {
          const filename = uri.split('/').pop() || `image_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formData.append('images', {
            uri,
            name: filename,
            type,
          } as any);
        });
        
        await propertyService.uploadPropertyImages(property.id, formData);
      }
      
      Alert.alert(
        'Успех',
        'Объект недвижимости успешно создан',
        [{ text: 'OK', onPress: () => router.push('/properties') }]
      );
    } catch (error) {
      console.error('Ошибка при создании объекта:', error);
      Alert.alert('Ошибка', 'Не удалось создать объект недвижимости');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Добавить объект' }} />
      
      <Formik
        initialValues={initialValues}
        validationSchema={PropertySchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Основная информация</Text>
            
            <Text style={styles.label}>Название объекта</Text>
            <TextInput
              style={styles.input}
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              placeholder="Например: Уютная квартира в центре"
            />
            {touched.title && errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              placeholder="Подробное описание объекта"
              multiline
              numberOfLines={5}
            />
            {touched.description && errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            
            <Text style={styles.label}>Адрес</Text>
            <TextInput
              style={styles.input}
              value={values.address}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              placeholder="Полный адрес объекта"
            />
            {touched.address && errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
            
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Цена</Text>
                <TextInput
                  style={styles.input}
                  value={values.price.toString()}
                  onChangeText={(value) => setFieldValue('price', value ? parseFloat(value) : 0)}
                  onBlur={handleBlur('price')}
                  placeholder="0"
                  keyboardType="numeric"
                />
                {touched.price && errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>
              
              <View style={styles.column}>
                <Text style={styles.label}>За</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      values.priceUnit === 'day' && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFieldValue('priceUnit', 'day')}
                  >
                    <Text style={styles.pickerText}>День</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      values.priceUnit === 'night' && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFieldValue('priceUnit', 'night')}
                  >
                    <Text style={styles.pickerText}>Ночь</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      values.priceUnit === 'month' && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFieldValue('priceUnit', 'month')}
                  >
                    <Text style={styles.pickerText}>Месяц</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Характеристики</Text>
            
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Комнаты</Text>
                <TextInput
                  style={styles.input}
                  value={values.rooms.toString()}
                  onChangeText={(value) => setFieldValue('rooms', value ? parseInt(value) : 0)}
                  onBlur={handleBlur('rooms')}
                  placeholder="1"
                  keyboardType="numeric"
                />
                {touched.rooms && errors.rooms && (
                  <Text style={styles.errorText}>{errors.rooms}</Text>
                )}
              </View>
              
              <View style={styles.column}>
                <Text style={styles.label}>Спальные места</Text>
                <TextInput
                  style={styles.input}
                  value={values.beds.toString()}
                  onChangeText={(value) => setFieldValue('beds', value ? parseInt(value) : 0)}
                  onBlur={handleBlur('beds')}
                  placeholder="1"
                  keyboardType="numeric"
                />
                {touched.beds && errors.beds && (
                  <Text style={styles.errorText}>{errors.beds}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Ванные комнаты</Text>
                <TextInput
                  style={styles.input}
                  value={values.bathrooms.toString()}
                  onChangeText={(value) => setFieldValue('bathrooms', value ? parseInt(value) : 0)}
                  onBlur={handleBlur('bathrooms')}
                  placeholder="1"
                  keyboardType="numeric"
                />
                {touched.bathrooms && errors.bathrooms && (
                  <Text style={styles.errorText}>{errors.bathrooms}</Text>
                )}
              </View>
              
              <View style={styles.column}>
                <Text style={styles.label}>Макс. гостей</Text>
                <TextInput
                  style={styles.input}
                  value={values.maxGuests.toString()}
                  onChangeText={(value) => setFieldValue('maxGuests', value ? parseInt(value) : 0)}
                  onBlur={handleBlur('maxGuests')}
                  placeholder="1"
                  keyboardType="numeric"
                />
                {touched.maxGuests && errors.maxGuests && (
                  <Text style={styles.errorText}>{errors.maxGuests}</Text>
                )}
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Удобства</Text>
            <View style={styles.amenitiesContainer}>
              {amenitiesList.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityItem,
                    values.amenities.includes(amenity) && styles.amenitySelected
                  ]}
                  onPress={() => {
                    const newAmenities = values.amenities.includes(amenity)
                      ? values.amenities.filter(a => a !== amenity)
                      : [...values.amenities, amenity];
                    setFieldValue('amenities', newAmenities);
                  }}
                >
                  <Text style={values.amenities.includes(amenity) ? styles.amenityTextSelected : styles.amenityText}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Фотографии</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
              <Text style={styles.imagePickerButtonText}>Добавить фотографии</Text>
            </TouchableOpacity>
            
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageButtonText}>×</Text>
                    </TouchableOpacity>
                    <Image source={{ uri }} style={styles.previewImage} />
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Создать объект</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  pickerOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerTextSelected: {
    color: '#fff',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  amenityItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 12,
    margin: 5,
    backgroundColor: '#f5f5f5',
  },
  amenitySelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  amenityTextSelected: {
    color: '#fff',
  },
  imagePickerButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 5,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 