const dotenv = require('dotenv');
const axios = require('axios');
// Загружаем переменные окружения
dotenv.config();
// Проверяем настройки ЮKassa
console.log('Настройки ЮKassa:');
console.log('- YOOKASSA_SHOP_ID:', process.env.YOOKASSA_SHOP_ID || 'не установлен');
console.log('- YOOKASSA_SECRET_KEY:', process.env.YOOKASSA_SECRET_KEY ? '***' + process.env.YOOKASSA_SECRET_KEY.substr(-4) : 'не установлен');
console.log('- PAYMENT_RETURN_URL:', process.env.PAYMENT_RETURN_URL || 'не установлен');
// Проверяем сервис оплаты
const testPaymentService = async () => {
    var _a;
    try {
        // Формируем тестовые данные для запроса к ЮKassa API
        const yookassaPayload = {
            amount: {
                value: '10.00',
                currency: 'RUB'
            },
            capture: true,
            confirmation: {
                type: 'redirect',
                return_url: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/success'
            },
            description: 'Тестовый платеж',
            metadata: {
                paymentId: 'test-payment-id',
                bookingId: 'test-booking-id'
            }
        };
        // Проверяем, установлены ли необходимые переменные окружения
        if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
            console.error('\n❌ Не установлены необходимые переменные окружения для ЮKassa');
            console.error('Убедитесь, что в файле .env определены YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY');
            return;
        }
        console.log('\nОтправка тестового запроса к API ЮKassa...');
        // Отправляем запрос к ЮKassa API
        const response = await axios.post('https://api.yookassa.ru/v3/payments', yookassaPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': 'test-' + Date.now(),
                'Authorization': `Basic ${Buffer.from(process.env.YOOKASSA_SHOP_ID + ':' + process.env.YOOKASSA_SECRET_KEY).toString('base64')}`
            }
        });
        console.log('\n✅ Запрос к API ЮKassa выполнен успешно');
        console.log('Ответ API:');
        console.log('- ID платежа:', response.data.id);
        console.log('- Статус:', response.data.status);
        console.log('- URL для оплаты:', ((_a = response.data.confirmation) === null || _a === void 0 ? void 0 : _a.confirmation_url) || 'Не предоставлен');
        // Сохраняем полный ответ в файл для анализа
        const fs = require('fs');
        fs.writeFileSync('yookassa-response.json', JSON.stringify(response.data, null, 2));
        console.log('\nПолный ответ сохранен в файл yookassa-response.json');
    }
    catch (error) {
        console.error('\n❌ Ошибка при отправке запроса к API ЮKassa:');
        if (error.response) {
            // Ошибка от сервера ЮKassa
            console.error(`Код ошибки: ${error.response.status}`);
            console.error('Ответ сервера:', error.response.data);
        }
        else if (error.request) {
            // Ошибка сети
            console.error('Не удалось получить ответ от сервера');
            console.error('Запрос:', error.request);
        }
        else {
            // Другие ошибки
            console.error('Ошибка:', error.message);
        }
        console.error('\nПроверьте правильность настроек ЮKassa в файле .env');
    }
};
// Запускаем тест
testPaymentService();
