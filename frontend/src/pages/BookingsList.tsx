import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  SelectChangeEvent,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Search as SearchIcon } from '@mui/icons-material';
import bookingService, { Booking, BookingFilters } from '../services/bookingService';
import BookingStatusChip from '../components/bookings/BookingStatusChip';

const BookingsList: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Фильтры
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAllBookings({
        ...filters,
        page: page + 1,
        limit: pageSize,
      });
      
      setBookings(response.bookings);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      setError('Не удалось загрузить бронирования. Пожалуйста, попробуйте позже.');
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
      startDate: '',
      endDate: '',
    });
    setPage(0);
  };

  const handleRowClick = (params: any) => {
    navigate(`/bookings/${params.id}`);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { 
      field: 'property', 
      headerName: 'Объект', 
      width: 250,
      valueGetter: (params) => params.row.property?.title || 'Н/Д',
    },
    { 
      field: 'user', 
      headerName: 'Пользователь', 
      width: 200,
      valueGetter: (params) => params.row.user?.name || 'Н/Д',
    },
    { 
      field: 'startDate', 
      headerName: 'Дата заезда', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU'),
    },
    { 
      field: 'endDate', 
      headerName: 'Дата выезда', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ru-RU'),
    },
    { 
      field: 'totalPrice', 
      headerName: 'Сумма', 
      width: 120,
      valueFormatter: (params) => `${params.value} ₽`,
    },
    { 
      field: 'status', 
      headerName: 'Статус', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <BookingStatusChip status={params.value as any} />
      ),
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
        Бронирования
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
                <MenuItem value="pending">Ожидает</MenuItem>
                <MenuItem value="confirmed">Подтверждено</MenuItem>
                <MenuItem value="cancelled">Отменено</MenuItem>
                <MenuItem value="completed">Завершено</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="startDate"
              label="Дата заезда от"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              name="endDate"
              label="Дата заезда до"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={fetchBookings}
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

      {/* Таблица бронирований */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={bookings}
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

export default BookingsList; 