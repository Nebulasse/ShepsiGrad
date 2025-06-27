import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import bookingService from '../services/bookingService';
import BookingStatusChip from '../components/bookings/BookingStatusChip';

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
} from '@mui/material';

const BookingDetails = () => {
  const params = useLocalSearchParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для диалога отмены
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Ошибка при загрузке данных бронирования:', error);
      setError('Не удалось загрузить данные бронирования');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await bookingService.confirmBooking(bookingId);
      fetchBookingDetails(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при подтверждении бронирования:', error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(bookingId, cancelReason);
      setCancelDialogOpen(false);
      fetchBookingDetails(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
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

    if (!booking) {
      return (
        <View style={styles.container}>
          <Text>Бронирование не найдено</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Бронирование #{booking.id}</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Статус:</Text>
          <Text style={styles.value}>{booking.status}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Объект:</Text>
          <Text style={styles.value}>{booking.property?.title || 'Н/Д'}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Клиент:</Text>
          <Text style={styles.value}>{booking.user?.name || 'Н/Д'}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Даты:</Text>
          <Text style={styles.value}>
            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Сумма:</Text>
          <Text style={styles.value}>{booking.totalPrice} ₽</Text>
        </View>
      </ScrollView>
    );
  }

  // Для веб-версии
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Детали бронирования
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : !booking ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Бронирование не найдено</Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h5">
                  Бронирование #{booking.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <BookingStatusChip status={booking.status} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Информация о бронировании
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Объект
                  </Typography>
                  <Typography variant="body1">
                    {booking.property?.title || 'Н/Д'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Даты проживания
                  </Typography>
                  <Typography variant="body1">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Сумма
                  </Typography>
                  <Typography variant="body1">
                    {booking.totalPrice} ₽
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Статус оплаты
                  </Typography>
                  <Chip
                    label={booking.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                    color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Информация о клиенте
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Имя
                  </Typography>
                  <Typography variant="body1">
                    {booking.user?.name || 'Н/Д'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {booking.user?.email || 'Н/Д'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Дата создания бронирования
                  </Typography>
                  <Typography variant="body1">
                    {new Date(booking.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {booking.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmBooking}
                  >
                    Подтвердить бронирование
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Отменить бронирование
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {/* Диалог для отмены бронирования */}
          <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
            <DialogTitle>Отмена бронирования</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Вы уверены, что хотите отменить бронирование #{booking.id}?
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Причина отмены"
                fullWidth
                multiline
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCancelDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleCancelBooking} color="error">
                Подтвердить отмену
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
  },
  errorText: {
    color: 'red',
  },
});

export default BookingDetails; 