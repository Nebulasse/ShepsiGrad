import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import bookingService from '../services/bookingService';
import propertyService from '../services/propertyService';

// Для веб-версии
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Home as PropertyIcon,
  EventAvailable as BookingIcon,
  Person as UserIcon,
  Star as ReviewIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
    },
    properties: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    users: {
      total: 0,
      landlords: 0,
      tenants: 0,
    },
    reviews: {
      total: 0,
      average: 0,
    },
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Загружаем статистику по бронированиям
      const bookingStats = await bookingService.getBookingStats();
      
      // Загружаем статистику по объектам недвижимости
      const propertyStats = await propertyService.getPropertyStats();
      
      // Загружаем последние бронирования
      const recentBookingsData = await bookingService.getRecentBookings(5);
      
      // Объединяем данные статистики
      setStats({
        bookings: bookingStats.bookings,
        properties: propertyStats.properties,
        users: bookingStats.users || {
          total: 0,
          landlords: 0,
          tenants: 0,
        },
        reviews: propertyStats.reviews || {
          total: 0,
          average: 0,
        },
      });
      
      setRecentBookings(recentBookingsData);
    } catch (error) {
      console.error('Ошибка при загрузке данных для дашборда:', error);
      setError('Не удалось загрузить данные для дашборда');
    } finally {
      setLoading(false);
    }
  };

  const navigateToBookings = () => {
    if (Platform.OS === 'web') {
      router.push('/bookings');
    } else {
      router.push('/bookings');
    }
  };

  const navigateToProperties = () => {
    if (Platform.OS === 'web') {
      router.push('/properties');
    } else {
      router.push('/properties');
    }
  };

  // Для мобильной версии
  if (Platform.OS !== 'web') {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Загрузка...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Панель управления</Text>
        
        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bookings.total}</Text>
            <Text style={styles.statLabel}>Бронирований</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.properties.total}</Text>
            <Text style={styles.statLabel}>Объектов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.users.total}</Text>
            <Text style={styles.statLabel}>Пользователей</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.reviews.total}</Text>
            <Text style={styles.statLabel}>Отзывов</Text>
          </View>
        </View>
        
        {/* Последние бронирования */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Последние бронирования</Text>
          {recentBookings.length > 0 ? (
            recentBookings.map((booking, index) => (
              <View key={booking.id} style={styles.bookingItem}>
                <Text style={styles.bookingTitle}>
                  {booking.property?.title || 'Объект не найден'}
                </Text>
                <Text style={styles.bookingDetails}>
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.bookingUser}>
                  Клиент: {booking.user?.name || 'Н/Д'}
                </Text>
                <View style={[
                  styles.bookingStatus,
                  booking.status === 'confirmed' ? styles.statusConfirmed :
                  booking.status === 'cancelled' ? styles.statusCancelled :
                  styles.statusPending
                ]}>
                  <Text style={styles.statusText}>
                    {booking.status === 'confirmed' ? 'Подтверждено' :
                     booking.status === 'cancelled' ? 'Отменено' :
                     'В ожидании'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Нет доступных бронирований</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  // Для веб-версии
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель управления
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <>
          {/* Статистика */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookingIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Бронирования
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div">
                    {stats.bookings.total}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      В ожидании: {stats.bookings.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Подтверждено: {stats.bookings.confirmed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Отменено: {stats.bookings.cancelled}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PropertyIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Объекты
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div">
                    {stats.properties.total}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      На модерации: {stats.properties.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Подтверждено: {stats.properties.approved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Отклонено: {stats.properties.rejected}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff8e1' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <UserIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Пользователи
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div">
                    {stats.users.total}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Арендодатели: {stats.users.landlords}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Арендаторы: {stats.users.tenants}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fce4ec' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReviewIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Отзывы
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div">
                    {stats.reviews.total}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Средняя оценка: {stats.reviews.average.toFixed(1)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Последние бронирования */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Последние бронирования</Typography>
                  <Button variant="outlined" size="small" onClick={navigateToBookings}>
                    Все бронирования
                  </Button>
                </Box>
                <List>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <React.Fragment key={booking.id}>
                        <ListItem>
                          <ListItemText
                            primary={booking.property?.title || 'Объект не найден'}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2">
                                  Клиент: {booking.user?.name || 'Н/Д'}
                                </Typography>
                              </>
                            }
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                bgcolor:
                                  booking.status === 'confirmed' ? '#e8f5e9' :
                                  booking.status === 'cancelled' ? '#ffebee' :
                                  '#fff8e1',
                                color:
                                  booking.status === 'confirmed' ? '#2e7d32' :
                                  booking.status === 'cancelled' ? '#c62828' :
                                  '#f57f17',
                              }}
                            >
                              {booking.status === 'confirmed' ? 'Подтверждено' :
                               booking.status === 'cancelled' ? 'Отменено' :
                               'В ожидании'}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < recentBookings.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="Нет доступных бронирований" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Объекты на модерации</Typography>
                  <Button variant="outlined" size="small" onClick={navigateToProperties}>
                    Все объекты
                  </Button>
                </Box>
                {/* Здесь можно добавить список объектов, требующих модерации */}
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  Данные о модерации объектов будут доступны в следующей версии
                </Typography>
              </Paper>
            </Grid>
          </Grid>
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
    color: '#d32f2f',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookingItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bookingUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookingStatus: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusConfirmed: {
    backgroundColor: '#e8f5e9',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
  },
  statusPending: {
    backgroundColor: '#fff8e1',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
});

export default Dashboard; 