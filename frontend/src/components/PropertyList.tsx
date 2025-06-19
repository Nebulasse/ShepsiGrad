import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button,
  Container,
  Box,
  CircularProgress
} from '@mui/material';
import { Property } from '../types/property';
import { propertyService } from '../services/propertyService';

interface PropertyListProps {
  onPropertySelect?: (property: Property) => void;
  filters?: Record<string, any>;
}

export const PropertyList: React.FC<PropertyListProps> = ({ onPropertySelect, filters }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperties(filters);
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Объекты не найдены</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={property.images[0] || '/placeholder.jpg'}
                  alt={property.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {property.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {property.price.toLocaleString()} ₽/месяц
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {property.address.city}, {property.address.street}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.features.bedrooms} комн. • {property.features.area} м²
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={() => onPropertySelect?.(property)}
                  >
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}; 