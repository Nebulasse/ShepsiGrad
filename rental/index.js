// Принудительно устанавливаем переменные окружения для JSC
process.env.EXPO_USE_HERMES = "0";
process.env.EXPO_JS_ENGINE = "jsc";
process.env.EXPO_NO_HERMES = "1";
process.env.JS_ENGINE = "jsc";

// Проверяем, запущено ли приложение в JSC
const isJSC = () => !global.HermesInternal;

console.log(`[Startup] Используется ${isJSC() ? 'JSC' : 'Hermes'} JavaScript движок`);

// Если используется JSC, всё хорошо
if (isJSC()) {
  console.log('[Startup] JSC движок активен - полифиллы не требуются');
} else {
  console.warn('[Startup] Внимание: Приложение запущено с Hermes движком. Для решения проблем с require() рекомендуется использовать JSC движок.');
  console.warn('[Startup] Измените jsEngine на "jsc" в app.config.js и перезапустите приложение.');
}

// Импортируем приложение
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);