import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { PropertyList } from '../components/PropertyList';
import { Property, PropertyFilters } from '../types/property';
import PropertyCard from '../components/property/PropertyCard';
import MapView from '../components/map/MapView';
import { mapService } from '../services/mapService';
import './PropertiesPage.css';

export const PropertiesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Имитация загрузки данных (в реальном приложении здесь будет API-запрос)
  useEffect(() => {
    // Для демонстрации создадим тестовые данные
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Уютная квартира в центре',
        description: 'Светлая и просторная квартира в историческом центре города. Рядом парки, кафе и магазины.',
        price: 3500,
        address: 'ул. Ленина, 15, Москва',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        latitude: 55.7522,
        longitude: 37.6156,
        ownerId: 'owner-1'
      },
      {
        id: '2',
        title: 'Стильный лофт',
        description: 'Современный лофт с высокими потолками и большими окнами. Полностью меблирован.',
        price: 4200,
        address: 'ул. Пушкина, 10, Москва',
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        latitude: 55.7539,
        longitude: 37.6208,
        ownerId: 'owner-2'
      },
      {
        id: '3',
        title: 'Просторная квартира с видом на реку',
        description: 'Квартира с панорамным видом на реку. Есть балкон, кондиционер, Wi-Fi.',
        price: 5000,
        address: 'Набережная ул., 5, Москва',
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'],
        bedrooms: 3,
        bathrooms: 2,
        area: 85,
        latitude: 55.7558,
        longitude: 37.6173,
        ownerId: 'owner-3'
      }
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = async (address: string) => {
    if (!address.trim()) {
      setError('Введите адрес для поиска');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await mapService.geocodeAddress(address);
      setSearchLocation({ lat: result.latitude, lng: result.longitude });
      setViewMode('map'); // Переключаемся на режим карты при поиске
    } catch (err) {
      console.error('Error during search:', err);
      setError('Не удалось найти указанный адрес. Пожалуйста, уточните запрос.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleApplyFilters = () => {
    setIsFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({});
    setIsFilterDialogOpen(false);
  };

  const filteredProperties = properties.filter(property => {
    if (filters.city && !property.address.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    if (filters.minPrice && property.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && property.price > filters.maxPrice) {
      return false;
    }
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
      return false;
    }
    return true;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Объекты недвижимости
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => setIsFilterDialogOpen(true)}
          >
            Фильтры
          </Button>
        </Box>

        <Dialog 
          open={isFilterDialogOpen} 
          onClose={() => setIsFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Фильтры</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Город"
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Мин. цена"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Макс. цена"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Количество комнат"
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleFilterChange('bedrooms', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Статус"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="available">Доступно</MenuItem>
                  <MenuItem value="rented">Арендовано</MenuItem>
                  <MenuItem value="maintenance">На обслуживании</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Мебель"
                  value={filters.furnished ? 'true' : ''}
                  onChange={(e) => handleFilterChange('furnished', e.target.value === 'true')}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="true">С мебелью</MenuItem>
                  <MenuItem value="false">Без мебели</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleResetFilters}>Сбросить</Button>
            <Button onClick={handleApplyFilters} variant="contained">Применить</Button>
          </DialogActions>
        </Dialog>

        <div className="search-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Введите адрес или район"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="search-input"
              aria-label="Адрес или район для поиска"
            />
            <button 
              className="search-button"
              onClick={() => handleSearch(filters.city || 'Москва')}
            >
              Найти
            </button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Список
            </button>
            <button 
              className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              Карта
            </button>
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="price-min">Цена:</label>
            <input
              id="price-min"
              type="number"
              placeholder="От"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
              className="filter-input small"
              aria-label="Минимальная цена"
            />
            <input
              type="number"
              placeholder="До"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
              className="filter-input small"
              aria-label="Максимальная цена"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="bedrooms-select">Комнаты:</label>
            <select 
              id="bedrooms-select"
              value={filters.bedrooms || ''}
              onChange={(e) => handleFilterChange('bedrooms', Number(e.target.value))}
              className="filter-select"
              aria-label="Количество комнат"
              title="Количество комнат"
            >
              <option value="">Любое</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="property-type-select">Тип:</label>
            <select 
              id="property-type-select"
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="filter-select"
              aria-label="Тип недвижимости"
              title="Тип недвижимости"
            >
              <option value="">Все</option>
              <option value="apartment">Квартира</option>
              <option value="house">Дом</option>
              <option value="room">Комната</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">Загрузка объектов...</div>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="properties-grid">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map(property => (
                    <div className="property-card-container" key={property.id}>
                      <PropertyCard 
                        id={property.id}
                        title={property.title}
                        description={property.description}
                        price={property.price}
                        address={property.address}
                        image={property.images[0] || ''}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.area}
                        ownerId={property.ownerId}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>Не найдено объектов, соответствующих фильтрам</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="map-container">
                <MapView 
                  initialLatitude={searchLocation?.lat}
                  initialLongitude={searchLocation?.lng}
                  showNearbyProperties={true}
                  radius={5000}
                />
                
                <div className="map-instructions">
                  <p>
                    <i className="map-info-icon">ℹ️</i>
                    Нажмите на маркер, чтобы увидеть подробную информацию об объекте.
                    Ценники над маркерами показывают ежемесячную стоимость аренды.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}; 