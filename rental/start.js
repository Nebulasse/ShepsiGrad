/**
 * Скрипт для запуска приложения с очисткой кэша
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Пути к директориям, которые нужно удалить
const dirsToRemove = [
  '.expo',
  'node_modules/.cache',
];

// Функция для удаления директории
function removeDir(dir) {
  try {
    if (fs.existsSync(dir)) {
      console.log(`Удаление директории: ${dir}`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Ошибка при удалении ${dir}: ${err.message}`);
  }
}

// Удаляем директории
dirsToRemove.forEach(dir => {
  removeDir(path.join(__dirname, dir));
});

console.log('Кэш очищен, запускаем приложение...');

// Запускаем приложение
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (err) {
  console.error('Ошибка при запуске приложения:', err.message);
} 