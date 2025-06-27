/**
 * Скрипт для запуска приложения с JSC движком
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

console.log('Кэш очищен, запускаем приложение с JSC движком...');

// Создаем временный файл app.json с JSC движком
const appJsonPath = path.join(__dirname, 'app.json');
let appJsonContent;

try {
  // Читаем текущий app.json
  appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  
  // Парсим JSON
  const appJson = JSON.parse(appJsonContent);
  
  // Устанавливаем JSC движок
  if (appJson.expo) {
    appJson.expo.jsEngine = 'jsc';
    console.log('Установлен JSC движок в app.json');
  }
  
  // Записываем обновленный JSON
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2), 'utf8');
  
  // Запускаем приложение
  try {
    execSync('npx expo start --clear', { stdio: 'inherit' });
  } catch (err) {
    console.error('Ошибка при запуске приложения:', err.message);
  }
  
  // Восстанавливаем оригинальный app.json
  fs.writeFileSync(appJsonPath, appJsonContent, 'utf8');
} catch (err) {
  console.error('Ошибка при обработке app.json:', err.message);
  
  // Восстанавливаем оригинальный app.json, если он был прочитан
  if (appJsonContent) {
    fs.writeFileSync(appJsonPath, appJsonContent, 'utf8');
  }
} 