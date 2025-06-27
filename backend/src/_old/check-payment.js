const dotenv = require('dotenv');
const axios = require('axios');

// Загружаем переменные окружения
dotenv.config();

// ID платежа для проверки (из предыдущего ответа)
const paymentId = '2fe8a4df-000f-5001-8000-1c1fd0e70a77';

// Проверяем настройки ЮKassa
console.log('Настройки ЮKassa:');
console.log('- YOOKASSA_SHOP_ID:', process.env.YOOKASSA_SHOP_ID || 'не установлен');
console.log('- YOOKASSA_SECRET_KEY:', process.env.YOOKASSA_SECRET_KEY ? '***' + process.env.YOOKASSA_SECRET_KEY.substr(-4) : 'не установлен');

// Функция для проверки статуса платежа
const checkPaymentStatus = async (paymentId) => {
  try {
    // Проверяем, установлены ли необходимые переменные окружения
    if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
      console.error('\n❌ Не установлены необходимые переменные окружения для ЮKassa');
      console.error('Убедитесь, что в файле .env определены YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY');
      return;
    }
    
    console.log(`\nПроверка статуса платежа с ID: ${paymentId}...`);
    
    // Отправляем запрос к ЮKassa API для получения информации о платеже
    const response = await axios.get(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.YOOKASSA_SHOP_ID + ':' + process.env.YOOKASSA_SECRET_KEY).toString('base64')}`
        }
      }
    );
    
    console.log('\n✅ Запрос к API ЮKassa выполнен успешно');
    console.log('Информация о платеже:');
    console.log('- ID платежа:', response.data.id);
    console.log('- Статус:', response.data.status);
    console.log('- Сумма:', `${response.data.amount.value} ${response.data.amount.currency}`);
    console.log('- Оплачен:', response.data.paid ? 'Да' : 'Нет');
    console.log('- Дата создания:', new Date(response.data.created_at).toLocaleString());
    
    if (response.data.status === 'succeeded') {
      console.log('- Дата оплаты:', new Date(response.data.captured_at).toLocaleString());
    }
    
    // Сохраняем полный ответ в файл для анализа
    const fs = require('fs');
    fs.writeFileSync('yookassa-payment-status.json', JSON.stringify(response.data, null, 2));
    console.log('\nПолный ответ сохранен в файл yookassa-payment-status.json');
    
  } catch (error) {
    console.error('\n❌ Ошибка при проверке статуса платежа:');
    
    if (error.response) {
      // Ошибка от сервера ЮKassa
      console.error(`Код ошибки: ${error.response.status}`);
      console.error('Ответ сервера:', error.response.data);
    } else if (error.request) {
      // Ошибка сети
      console.error('Не удалось получить ответ от сервера');
      console.error('Запрос:', error.request);
    } else {
      // Другие ошибки
      console.error('Ошибка:', error.message);
    }
    
    console.error('\nПроверьте правильность ID платежа и настроек ЮKassa в файле .env');
  }
};

// Запускаем проверку статуса платежа
checkPaymentStatus(paymentId); 