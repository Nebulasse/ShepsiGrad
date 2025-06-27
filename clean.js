/**
 * Скрипт для очистки проекта
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log('Проект очищен'); 