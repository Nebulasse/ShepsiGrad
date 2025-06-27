/**
 * Скрипт для полной очистки проекта
 * 
 * Этот скрипт удаляет все временные файлы и кэши,
 * которые могут вызывать проблемы после обновления Expo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Пути к директориям, которые нужно удалить
const dirsToRemove = [
  '.expo',
  'node_modules',
  'android/build',
  'android/app/build',
  'ios/build',
  'ios/Pods'
];

// Пути к файлам, которые нужно удалить
const filesToRemove = [
  'ios/Podfile.lock',
  'yarn.lock',
  'package-lock.json',
  'yarn-error.log',
  'npm-debug.log'
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

// Функция для удаления файла
function removeFile(file) {
  try {
    if (fs.existsSync(file)) {
      console.log(`Удаление файла: ${file}`);
      fs.unlinkSync(file);
    }
  } catch (err) {
    console.error(`Ошибка при удалении ${file}: ${err.message}`);
  }
}

// Удаляем директории
dirsToRemove.forEach(dir => {
  removeDir(path.join(__dirname, dir));
});

// Удаляем файлы
filesToRemove.forEach(file => {
  removeFile(path.join(__dirname, file));
});

// Очищаем кэш Metro
console.log('Очистка кэша Metro...');
try {
  execSync('npx react-native start --reset-cache --no-interactive', { stdio: 'ignore' });
  console.log('Кэш Metro очищен');
} catch (err) {
  console.error('Ошибка при очистке кэша Metro');
}

// Очищаем кэш npm
console.log('Очистка кэша npm...');
try {
  execSync('npm cache clean --force', { stdio: 'ignore' });
  console.log('Кэш npm очищен');
} catch (err) {
  console.error('Ошибка при очистке кэша npm');
}

console.log('\nПроект очищен. Теперь выполните:');
console.log('1. npm install');
console.log('2. npx expo start --clear'); 