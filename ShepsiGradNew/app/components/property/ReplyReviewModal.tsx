import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../types/Review';
import reviewService from '../../services/reviewService';

interface ReplyReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review: Review | null;
}

const ReplyReviewModal: React.FC<ReplyReviewModalProps> = ({
  visible,
  onClose,
  onSuccess,
  review
}) => {
  const [replyContent, setReplyContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Сброс формы при закрытии модального окна
  React.useEffect(() => {
    if (!visible) {
      setReplyContent('');
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!review) return;
    
    if (replyContent.trim().length < 5) {
      setError('Текст ответа должен содержать не менее 5 символов');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await reviewService.addReplyToReview(review.id, replyContent.trim());

      setSubmitting(false);
      onSuccess();
      setReplyContent('');
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError('Произошла ошибка при отправке ответа. Пожалуйста, попробуйте позже.');
      console.error('Ошибка при отправке ответа на отзыв:', err);
    }
  };

  if (!review) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ответ на отзыв</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.reviewContainer}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUserName}>{review.userName}</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={14}
                        color={star <= review.rating ? "#FFC107" : "#E0E0E0"}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>

              <Text style={styles.inputLabel}>Ваш ответ:</Text>
              <TextInput
                style={styles.replyInput}
                multiline
                numberOfLines={4}
                placeholder="Напишите ваш ответ на отзыв..."
                value={replyContent}
                onChangeText={setReplyContent}
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
                style={[styles.submitButton, (replyContent.trim().length < 5) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || replyContent.trim().length < 5}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Ответить</Text>
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
  reviewContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    minHeight: 100,
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

export default ReplyReviewModal; 