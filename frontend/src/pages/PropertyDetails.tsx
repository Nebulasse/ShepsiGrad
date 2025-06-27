import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import propertyService from '../services/propertyService';

// Для веб-версии
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';

const PropertyDetails = () => {
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для диалога отклонения
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
    } catch (error) {
      console.error('Ошибка при загрузке данных объекта:', error);
      setError('Не удалось загрузить данные объекта недвижимости');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async () => {
    try {
      await propertyService.approveProperty(propertyId);
      fetchPropertyDetails(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при подтверждении объекта:', error);
    }
  };

  const handleRejectProperty = async () => {
    try {
      await propertyService.rejectProperty(propertyId, rejectReason);
      setRejectDialogOpen(false);
      fetchPropertyDetails(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при отклонении объекта:', error);
    }
  };

  // Для мобильной версии
  if (Platform.OS !== 'web') {
    if (loading) {
      return (
        <View style={styles.container}>
          <Text>Загрузка...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!property) {
      return (
        <View style={styles.container}>
          <Text>Объект не найден</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{property.title}</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Адрес:</Text>
          <Text style={styles.value}>{property.address}, {property.city}, {property.country}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Цена:</Text>
          <Text style={styles.value}>{property.price} ₽/ночь</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Статус:</Text>
          <Text style={[
            styles.statusText,
            property.status === 'approved' ? styles.statusApproved : 
            property.status === 'rejected' ? styles.statusRejected : 
            styles.statusPending
          ]}>
            {property.status === 'approved' ? 'Подтверждено' : 
             property.status === 'rejected' ? 'Отклонено' : 
             'На рассмотрении'}
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Описание:</Text>
          <Text style={styles.value}>{property.description}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Детали:</Text>
          <Text style={styles.value}>Спальни: {property.bedrooms}</Text>
          <Text style={styles.value}>Ванные: {property.bathrooms}</Text>
          <Text style={styles.value}>Макс. гостей: {property.maxGuests}</Text>
        </View>
      </ScrollView>
    );
  }

  // Для веб-версии
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Детали объекта недвижимости
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : !property ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Объект не найден</Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h5">
                  {property.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {property.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={
                    property.status === 'approved' ? 'Подтверждено' :
                    property.status === 'rejected' ? 'Отклонено' :
                    'На рассмотрении'
                  }
                  color={
                    property.status === 'approved' ? 'success' :
                    property.status === 'rejected' ? 'error' :
                    'warning'
                  }
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {property.images && property.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Фотографии
                </Typography>
                <ImageList cols={3} rowHeight={200} gap={8}>
                  {property.images.map((image: string, index: number) => (
                    <ImageListItem key={index}>
                      <img src={image} alt={`Изображение ${index + 1}`} />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Информация об объекте
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Адрес
                  </Typography>
                  <Typography variant="body1">
                    {property.address}, {property.city}, {property.country}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Цена
                  </Typography>
                  <Typography variant="body1">
                    {property.price} ₽/ночь
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Детали
                  </Typography>
                  <Typography variant="body1">
                    Спальни: {property.bedrooms} | Ванные: {property.bathrooms} | Макс. гостей: {property.maxGuests}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Информация о владельце
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Имя
                  </Typography>
                  <Typography variant="body1">
                    {property.owner?.name || 'Н/Д'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {property.owner?.email || 'Н/Д'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Дата создания объявления
                  </Typography>
                  <Typography variant="body1">
                    {new Date(property.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Описание
              </Typography>
              <Typography variant="body1" paragraph>
                {property.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {property.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={handleApproveProperty}
                  >
                    Подтвердить объект
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    Отклонить объект
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {/* Диалог для отклонения объекта */}
          <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
            <DialogTitle>Отклонение объекта</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Вы уверены, что хотите отклонить объект "{property.title}"?
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Причина отклонения"
                fullWidth
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRejectDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleRejectProperty} color="error">
                Отклонить
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

// Стили для мобильной версии
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBlock: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusApproved: {
    backgroundColor: '#e6f7e6',
    color: '#2e7d32',
  },
  statusRejected: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  statusPending: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
  },
  errorText: {
    color: 'red',
  },
});

export default PropertyDetails; 