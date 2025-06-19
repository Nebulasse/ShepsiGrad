import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/Review';
import reviewService from '../../services/reviewService';

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  visible,
  onClose,
  onSuccess,
  propertyId,
  userId,
  userName,
  userAvatar
}) => {
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Пожалуйста, выберите рейтинг');
      return;
    }

    if (content.trim().length < 10) {
      setError('Текст отзыва должен содержать не менее 10 символов');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await reviewService.addReview({
        propertyId,
        userId,
        userName,
        userAvatar,
        rating,
        content,
        isVerifiedStay: true, // В реальном приложении это значение будет определяться на сервере
      });

      setSubmitting(false);
      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
      console.error('Ошибка при отправке отзыва:', err);
    }
  };

  const resetForm = () => {
    setRating(0);
    setContent('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Написать отзыв</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Ваша оценка:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={32}
                        color={star <= rating ? "#FFC107" : "#CCCCCC"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.ratingDescription}>
                  {rating === 1 && 'Ужасно'}
                  {rating === 2 && 'Плохо'}
                  {rating === 3 && 'Нормально'}
                  {rating === 4 && 'Хорошо'}
                  {rating === 5 && 'Отлично'}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Ваш отзыв:</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={6}
                placeholder="Расскажите о вашем опыте проживания..."
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitButton, (rating === 0 || content.trim().length < 10) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || rating === 0 || content.trim().length < 10}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Отправить отзыв</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    minHeight: 120,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 8,
    color: '#FF3B30',
    fontSize: 14,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#0075FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WriteReviewModal; 