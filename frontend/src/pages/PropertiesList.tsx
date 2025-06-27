import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import propertyService, { Property, PropertyFilters } from '../services/propertyService';

// Для веб-версии
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const PropertiesList = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Фильтры
  const [filters, setFilters] = useState<PropertyFilters>({
    status: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchProperties();
  }, [page, pageSize, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getAllProperties({
        ...filters,
        page: page + 1,
        limit: pageSize,
      });
      
      setProperties(response.properties);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Ошибка при загрузке объектов недвижимости:', error);
      setError('Не удалось загрузить объекты недвижимости. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({ ...prev, status: event.target.value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      city: '',
      country: '',
    });
    setPage(0);
  };

  const handleRowClick = (params: any) => {
    if (Platform.OS === 'web') {
      router.push(`/properties/${params.id}`);
    } else {
      router.push({
        pathname: '/property/[id]',
        params: { id: params.id }
      });
    }
  };

  // Для мобильной версии
  if (Platform.OS !== 'web') {
    const renderPropertyItem = ({ item }: { item: Property }) => (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => router.push({
          pathname: '/property/[id]',
          params: { id: item.id }
        })}
      >
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyAddress}>{item.address}, {item.city}</Text>
        <Text style={styles.propertyPrice}>{item.price} ₽/ночь</Text>
        <View style={styles.propertyStatus}>
          <Text style={[
            styles.statusText,
            item.status === 'approved' ? styles.statusApproved : 
            item.status === 'rejected' ? styles.statusRejected : 
            styles.statusPending
          ]}>
            {item.status === 'approved' ? 'Подтверждено' : 
             item.status === 'rejected' ? 'Отклонено' : 
             'На рассмотрении'}
          </Text>
        </View>
      </TouchableOpacity>
    );

    if (loading && properties.length === 0) {
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

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Объекты недвижимости</Text>
        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Нет доступных объектов недвижимости</Text>
          }
        />
      </View>
    );
  }

  // Для веб-версии
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { 
      field: 'title', 
      headerName: 'Название', 
      width: 250,
    },
    { 
      field: 'address', 
      headerName: 'Адрес', 
      width: 250,
      valueGetter: (params) => `${params.row.address}, ${params.row.city}`,
    },
    { 
      field: 'price', 
      headerName: 'Цена', 
      width: 120,
      valueFormatter: (params) => `${params.value} ₽`,
    },
    { 
      field: 'bedrooms', 
      headerName: 'Спальни', 
      width: 100,
    },
    { 
      field: 'status', 
      headerName: 'Статус', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.value === 'approved' ? 'Подтверждено' :
            params.value === 'rejected' ? 'Отклонено' :
            'На рассмотрении'
          }
          color={
            params.value === 'approved' ? 'success' :
            params.value === 'rejected' ? 'error' :
            'warning'
          }
          size="small"
          variant="outlined"
        />
      ),
    },
    { 
      field: 'owner', 
      headerName: 'Владелец', 
      width: 200,
      valueGetter: (params) => params.row.owner?.name || 'Н/Д',
    },
    { 
      field: 'createdAt', 
      headerName: 'Создано', 
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString('ru-RU'),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Объекты недвижимости
      </Typography>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleStatusChange}
                label="Статус"
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="pending">На рассмотрении</MenuItem>
                <MenuItem value="approved">Подтверждено</MenuItem>
                <MenuItem value="rejected">Отклонено</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="city"
              label="Город"
              value={filters.city}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="country"
              label="Страна"
              value={filters.country}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={fetchProperties}
                fullWidth
              >
                Поиск
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Сброс
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица объектов недвижимости */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading && properties.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={properties}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            onRowClick={handleRowClick}
            loading={loading}
          />
        )}
      </Paper>
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
  listContainer: {
    paddingBottom: 20,
  },
  propertyCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
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
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default PropertiesList; 