#!/usr/bin/env node

/**
 * Скрипт для очистки кэша и перезапуска приложения
 * 
 * Использование:
 * node clean-and-restart.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Начинаем очистку кэша...');

// Функция для выполнения команд
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} завершено`);
  } catch (error) {
    console.log(`❌ Ошибка при ${description}:`, error.message);
  }
}

// Функция для удаления папок
function removeDirectory(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    try {
      console.log(`🗑️  ${description}...`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${description} удалено`);
    } catch (error) {
      console.log(`❌ Ошибка при удалении ${description}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${description} не существует, пропускаем`);
  }
}

// Очищаем кэш Expo
runCommand('npx expo start --clear', 'Очистка кэша Expo');

// Удаляем папки кэша
removeDirectory(path.join(__dirname, '.expo'), 'Папка .expo');
removeDirectory(path.join(__dirname, 'node_modules'), 'Папка node_modules');

// Переустанавливаем зависимости
runCommand('npm install', 'Установка зависимостей');

console.log('🚀 Готово! Теперь запустите приложение командой:');
console.log('npm start'); 