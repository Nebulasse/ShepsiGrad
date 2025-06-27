import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Для веб-версии
import { Box, Typography, Button, Paper } from '@mui/material';

const NotFound = () => {
  const router = useRouter();

  const handleGoHome = () => {
    if (Platform.OS === 'web') {
      router.push('/');
    } else {
      router.push('/index');
    }
  };

  // Для мобильной версии
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Страница не найдена</Text>
        <Text style={styles.text}>
          Страница, которую вы ищете, не существует или была удалена.
        </Text>
        <View style={styles.buttonContainer}>
          <Text style={styles.button} onPress={handleGoHome}>
            Вернуться на главную
          </Text>
        </View>
      </View>
    );
  }

  // Для веб-версии
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: '#1976d2' }}>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Страница не найдена
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Страница, которую вы ищете, не существует или была удалена.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleGoHome}>
          Вернуться на главную
        </Button>
      </Paper>
    </Box>
  );
};

// Стили для мобильной версии
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default NotFound;
