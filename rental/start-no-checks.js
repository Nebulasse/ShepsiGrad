/**
 * Скрипт для запуска приложения с отключенными проверками
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

console.log('Кэш очищен, запускаем приложение с отключенными проверками...');

// Создаем временный файл app.config.js с JSC движком
const appConfigPath = path.join(__dirname, 'app.config.js');
let appConfigContent;

try {
  // Читаем текущий app.config.js
  appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
  
  // Создаем новый контент с JSC движком
  const newContent = appConfigContent.replace(
    /jsEngine:.*?,/g,
    'jsEngine: \'jsc\',\n    // Отключаем проверки типов для решения проблемы с require\n    typescript: { disableTypeChecking: true },\n    '
  );
  
  // Записываем обновленный файл
  fs.writeFileSync(appConfigPath, newContent, 'utf8');
  console.log('Установлен JSC движок и отключены проверки типов в app.config.js');
  
  // Запускаем приложение
  try {
    execSync('npx expo start --clear --no-dev --minify', { stdio: 'inherit' });
  } catch (err) {
    console.error('Ошибка при запуске приложения:', err.message);
  }
  
  // Восстанавливаем оригинальный app.config.js
  fs.writeFileSync(appConfigPath, appConfigContent, 'utf8');
} catch (err) {
  console.error('Ошибка при обработке app.config.js:', err.message);
  
  // Восстанавливаем оригинальный app.config.js, если он был прочитан
  if (appConfigContent) {
    fs.writeFileSync(appConfigPath, appConfigContent, 'utf8');
  }
} 