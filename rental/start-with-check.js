/**
 * Скрипт для запуска приложения с проверкой окружения
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

console.log('Кэш очищен, запускаем проверку окружения...');

// Запускаем проверку окружения
try {
  execSync('node check-environment.js', { stdio: 'inherit' });
} catch (err) {
  console.error('Ошибка при проверке окружения:', err.message);
}

console.log('\nЗапускаем приложение с JSC движком...');

// Создаем временный файл index.js с проверкой окружения
const indexPath = path.join(__dirname, 'index.js');
let indexContent;

try {
  // Читаем текущий index.js
  indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Создаем новый контент с проверкой окружения
  const newContent = `// Запускаем проверку окружения
require('./check-environment');

// Регистрируем полифиллы
require('./register-polyfills');

// Импортируем expo-router
import 'expo-router/entry';`;
  
  // Записываем обновленный файл
  fs.writeFileSync(indexPath, newContent, 'utf8');
  console.log('Добавлена проверка окружения в index.js');
  
  // Запускаем приложение с JSC движком
  try {
    execSync('node start-with-jsc.js', { stdio: 'inherit' });
  } catch (err) {
    console.error('Ошибка при запуске приложения:', err.message);
  }
  
  // Восстанавливаем оригинальный index.js
  fs.writeFileSync(indexPath, indexContent, 'utf8');
} catch (err) {
  console.error('Ошибка при обработке index.js:', err.message);
  
  // Восстанавливаем оригинальный index.js, если он был прочитан
  if (indexContent) {
    fs.writeFileSync(indexPath, indexContent, 'utf8');
  }
} 