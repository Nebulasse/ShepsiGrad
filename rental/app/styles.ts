/**
 * Глобальные стили приложения
 * 
 * Этот файл содержит общие стили, используемые во всем приложении,
 * с учетом кроссплатформенной совместимости
 */

import { StyleSheet, Platform } from 'react-native';

// Создаем кроссплатформенные тени
export const createShadow = (
  elevation = 2,
  shadowColor = '#000',
  shadowOpacity = 0.1,
  shadowRadius = 3,
  shadowOffset = { width: 0, height: 2 }
) => {
  if (Platform.OS === 'web') {
    // Для веб используем boxShadow
    return {
      boxShadow: `0px ${shadowOffset.height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`
    };
  } else {
    // Для мобильных платформ используем стандартные свойства
    return {
      elevation,
      shadowColor,
      shadowOpacity,
      shadowRadius,
      shadowOffset
    };
  }
};

// Глобальные стили
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...createShadow(2)
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4D8EFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow(3)
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE2E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#DFE2E6',
    marginVertical: 16,
  },
}); 