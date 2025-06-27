import request from 'supertest';
import { app } from '../../app';
import { connectDB, closeDB } from '../../database/connection';
import { Property } from '../../models/Property';
import mongoose from 'mongoose';

describe('Property Search API', () => {
  let authToken: string;
  let testProperties: any[] = [];

  // Подготавливаем тестовые данные перед запуском тестов
  beforeAll(async () => {
    await connectDB();
    
    // Очищаем коллекцию перед тестами
    await Property.deleteMany({});
    
    // Создаем тестовые объекты недвижимости
    const properties = [
      {
        title: 'Уютная квартира в центре',
        description: 'Просторная квартира с видом на море',
        price: 5000,
        address: 'ул. Приморская, 15',
        city: 'Шепси',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        amenities: ['wifi', 'parking', 'air_conditioning'],
        rating: 4.7,
        reviewsCount: 23,
        coordinates: { latitude: 43.598, longitude: 39.149 },
        isActive: true
      },
      {
        title: 'Роскошная вилла с бассейном',
        description: 'Вилла с частным бассейном и садом',
        price: 15000,
        address: 'ул. Горная, 5',
        city: 'Шепси',
        type: 'villa',
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        amenities: ['wifi', 'parking', 'pool', 'air_conditioning', 'kitchen'],
        rating: 4.9,
        reviewsCount: 12,
        coordinates: { latitude: 43.602, longitude: 39.155 },
        isActive: true
      },
      {
        title: 'Бюджетная студия',
        description: 'Небольшая студия рядом с пляжем',
        price: 2500,
        address: 'ул. Пляжная, 7',
        city: 'Шепси',
        type: 'apartment',
        bedrooms: 0,
        bathrooms: 1,
        area: 30,
        amenities: ['wifi'],
        rating: 4.2,
        reviewsCount: 45,
        coordinates: { latitude: 43.595, longitude: 39.147 },
        isActive: true
      },
      {
        title: 'Семейный дом',
        description: 'Большой дом для семейного отдыха',
        price: 8000,
        address: 'ул. Лесная, 10',
        city: 'Туапсе',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        amenities: ['wifi', 'parking', 'kitchen', 'air_conditioning'],
        rating: 4.5,
        reviewsCount: 18,
        coordinates: { latitude: 44.105, longitude: 39.082 },
        isActive: true
      },
      {
        title: 'Неактивный объект',
        description: 'Этот объект не должен отображаться в поиске',
        price: 3000,
        address: 'ул. Скрытая, 1',
        city: 'Шепси',
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        area: 40,
        amenities: ['wifi'],
        rating: 0,
        reviewsCount: 0,
        coordinates: { latitude: 43.590, longitude: 39.140 },
        isActive: false
      }
    ];
    
    testProperties = await Property.insertMany(properties);
    
    // Получаем токен для авторизованных запросов
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginResponse.body.token;
  });
  
  afterAll(async () => {
    await Property.deleteMany({});
    await closeDB();
  });

  describe('GET /api/properties', () => {
    it('returns all active properties', async () => {
      const response = await request(app).get('/api/properties');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(4); // Исключая неактивный объект
      expect(response.body.total).toBe(4);
    });
    
    it('filters properties by city', async () => {
      const response = await request(app).get('/api/properties?city=Шепси');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(3);
      expect(response.body.properties[0].city).toBe('Шепси');
    });
    
    it('filters properties by price range', async () => {
      const response = await request(app).get('/api/properties?minPrice=3000&maxPrice=10000');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(2);
      expect(response.body.properties.every((p: any) => p.price >= 3000 && p.price <= 10000)).toBe(true);
    });
    
    it('filters properties by type', async () => {
      const response = await request(app).get('/api/properties?type=apartment');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(2);
      expect(response.body.properties.every((p: any) => p.type === 'apartment')).toBe(true);
    });
    
    it('filters properties by number of bedrooms', async () => {
      const response = await request(app).get('/api/properties?minBedrooms=3');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(2);
      expect(response.body.properties.every((p: any) => p.bedrooms >= 3)).toBe(true);
    });
    
    it('filters properties by amenities', async () => {
      const response = await request(app).get('/api/properties?amenities=pool');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(1);
      expect(response.body.properties[0].amenities).toContain('pool');
    });
    
    it('sorts properties by price ascending', async () => {
      const response = await request(app).get('/api/properties?sort=price_asc');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(4);
      
      // Проверяем, что объекты отсортированы по возрастанию цены
      for (let i = 0; i < response.body.properties.length - 1; i++) {
        expect(response.body.properties[i].price).toBeLessThanOrEqual(response.body.properties[i + 1].price);
      }
    });
    
    it('sorts properties by price descending', async () => {
      const response = await request(app).get('/api/properties?sort=price_desc');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(4);
      
      // Проверяем, что объекты отсортированы по убыванию цены
      for (let i = 0; i < response.body.properties.length - 1; i++) {
        expect(response.body.properties[i].price).toBeGreaterThanOrEqual(response.body.properties[i + 1].price);
      }
    });
    
    it('sorts properties by rating descending', async () => {
      const response = await request(app).get('/api/properties?sort=rating_desc');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBe(4);
      
      // Проверяем, что объекты отсортированы по убыванию рейтинга
      for (let i = 0; i < response.body.properties.length - 1; i++) {
        expect(response.body.properties[i].rating).toBeGreaterThanOrEqual(response.body.properties[i + 1].rating);
      }
    });
    
    it('paginates results correctly', async () => {
      // Первая страница
      const page1 = await request(app).get('/api/properties?limit=2&page=1');
      expect(page1.status).toBe(200);
      expect(page1.body.properties.length).toBe(2);
      expect(page1.body.total).toBe(4);
      expect(page1.body.page).toBe(1);
      expect(page1.body.pages).toBe(2);
      
      // Вторая страница
      const page2 = await request(app).get('/api/properties?limit=2&page=2');
      expect(page2.status).toBe(200);
      expect(page2.body.properties.length).toBe(2);
      expect(page2.body.page).toBe(2);
      
      // Проверяем, что объекты на разных страницах не повторяются
      const ids1 = page1.body.properties.map((p: any) => p.id);
      const ids2 = page2.body.properties.map((p: any) => p.id);
      const intersection = ids1.filter((id: string) => ids2.includes(id));
      expect(intersection.length).toBe(0);
    });
    
    it('returns properties near specified coordinates', async () => {
      const response = await request(app)
        .get('/api/properties?latitude=43.598&longitude=39.149&radius=1');
      
      expect(response.status).toBe(200);
      expect(response.body.properties.length).toBeGreaterThan(0);
      
      // Проверяем, что все возвращенные объекты находятся в указанном радиусе
      response.body.properties.forEach((property: any) => {
        const distance = calculateDistance(
          43.598, 39.149,
          property.coordinates.latitude, property.coordinates.longitude
        );
        expect(distance).toBeLessThanOrEqual(1); // 1 км
      });
    });
    
    it('handles invalid query parameters gracefully', async () => {
      const response = await request(app).get('/api/properties?minPrice=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('returns a specific property by ID', async () => {
      const propertyId = testProperties[0]._id.toString();
      const response = await request(app).get(`/api/properties/${propertyId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(propertyId);
      expect(response.body.title).toBe(testProperties[0].title);
    });
    
    it('returns 404 for non-existent property ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/properties/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
    
    it('returns 400 for invalid property ID format', async () => {
      const response = await request(app).get('/api/properties/invalid-id');
      
      expect(response.status).toBe(400);
    });
  });
});

// Вспомогательная функция для расчета расстояния между координатами (в км)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 