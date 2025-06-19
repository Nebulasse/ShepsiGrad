import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CancelBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (reason: string) => Promise<void>;
  bookingId: string;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  visible,
  onClose,
  onCancel,
  bookingId
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Пожалуйста, укажите причину отмены бронирования');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await onCancel(reason);
      handleClose();
    } catch (err) {
      console.error('Ошибка при отмене бронирования:', err);
      setError('Произошла ошибка при отмене бронирования. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Отмена бронирования</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={24} color="#FFC107" />
              <Text style={styles.warningText}>
                Вы уверены, что хотите отменить бронирование? Эту операцию нельзя отменить.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Причина отмены:</Text>
            <TextInput
              style={styles.input}
              placeholder="Укажите причину отмены бронирования"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Назад</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, (!reason.trim() || isLoading) && styles.disabledButton]} 
              onPress={handleCancel}
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Отменить бронирование</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 8,
    color: '#5D4037',
    flex: 1,
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    minHeight: 80,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#F44336',
    marginLeft: 4,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});

export default CancelBookingModal; 