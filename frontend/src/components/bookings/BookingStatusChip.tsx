import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Для веб-версии
import { Chip, ChipProps } from '@mui/material';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;

interface BookingStatusChipProps {
  status: BookingStatus;
}

const BookingStatusChip: React.FC<BookingStatusChipProps> = ({ status }) => {
  // Определение цвета и текста в зависимости от статуса
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'success',
          label: 'Подтверждено',
          mobileStyle: styles.statusConfirmed,
        };
      case 'cancelled':
        return {
          color: 'error',
          label: 'Отменено',
          mobileStyle: styles.statusCancelled,
        };
      case 'completed':
        return {
          color: 'primary',
          label: 'Завершено',
          mobileStyle: styles.statusCompleted,
        };
      case 'pending':
      default:
        return {
          color: 'warning',
          label: 'В ожидании',
          mobileStyle: styles.statusPending,
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Для мобильной версии
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, statusConfig.mobileStyle]}>
        <Text style={styles.text}>{statusConfig.label}</Text>
      </View>
    );
  }

  // Для веб-версии
  return (
    <Chip
      label={statusConfig.label}
      color={statusConfig.color as ChipProps['color']}
      size="small"
      variant="outlined"
    />
  );
};

// Стили для мобильной версии
const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusPending: {
    backgroundColor: '#fff8e1',
    borderColor: '#f57f17',
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
    borderWidth: 1,
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
    borderColor: '#c62828',
    borderWidth: 1,
  },
  statusCompleted: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1565c0',
    borderWidth: 1,
  },
});

export default BookingStatusChip; 