import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_CONFIG } from '../config';

class ImageService {
  // Выбор изображений из галереи
  async pickImages(options = { allowMultiple: true, maxImages: 10 }) {
    try {
      // Запрос разрешений
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return { success: false, images: [] };
      }
      
      // Открытие выбора изображений
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !options.allowMultiple,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: options.allowMultiple,
        selectionLimit: options.maxImages,
      });
      
      if (result.canceled) {
        return { success: false, images: [] };
      }
      
      return { 
        success: true, 
        images: result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.uri.split('/').pop() || `image_${Date.now()}.jpg`,
          type: 'image/jpeg'
        }))
      };
    } catch (error) {
      console.error('Ошибка при выборе изображений:', error);
      return { success: false, images: [] };
    }
  }
  
  // Загрузка изображений на сервер
  async uploadImages(images, propertyId) {
    try {
      const uploadedImages = [];
      
      for (const image of images) {
        // Создаем FormData для отправки файла
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
        formData.append('propertyId', propertyId);
        
        // Отправляем запрос на сервер
        const response = await axios.post(
          `${API_CONFIG.baseUrl}/api/images/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        if (response.data && response.data.imageUrl) {
          uploadedImages.push(response.data.imageUrl);
        }
      }
      
      return { success: true, images: uploadedImages };
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      return { success: false, images: [] };
    }
  }
  
  // Сжатие изображения перед загрузкой
  async compressImage(uri) {
    try {
      // Для быстрого деплоя просто возвращаем исходное URI
      // В реальном приложении здесь должен быть код для сжатия изображения
      return { success: true, uri };
    } catch (error) {
      console.error('Ошибка при сжатии изображения:', error);
      return { success: false, uri };
    }
  }
  
  // Удаление изображения с сервера
  async deleteImage(imageUrl, propertyId) {
    try {
      const imageId = imageUrl.split('/').pop().split('.')[0];
      
      const response = await axios.delete(
        `${API_CONFIG.baseUrl}/api/images/${imageId}`,
        {
          data: { propertyId }
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      return { success: false };
    }
  }
}

export const imageService = new ImageService();

// Экспорт по умолчанию для маршрутизации
export default function ImageServiceProvider() {
  // Этот компонент нужен только для маршрутизации expo-router
  return null;
} 