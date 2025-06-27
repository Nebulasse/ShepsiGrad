const { Pool } = require('pg');
const dotenv = require('dotenv');
// Загружаем переменные окружения
dotenv.config();
// Тестовые параметры подключения (если нет .env файла)
const testConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'shepsigrad_test'
};
// Получаем параметры подключения из переменных окружения или используем тестовые
const connectionConfig = {
    host: process.env.DB_HOST || testConfig.host,
    port: parseInt(process.env.DB_PORT || testConfig.port, 10),
    user: process.env.DB_USERNAME || testConfig.user,
    password: process.env.DB_PASSWORD || testConfig.password,
    database: process.env.DB_NAME || testConfig.database,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : undefined
};
// Выводим используемые параметры подключения
console.log('Используемые параметры подключения:');
console.log(`- Хост: ${connectionConfig.host}`);
console.log(`- Порт: ${connectionConfig.port}`);
console.log(`- Пользователь: ${connectionConfig.user}`);
console.log(`- База данных: ${connectionConfig.database}`);
console.log(`- SSL: ${process.env.DB_SSL === 'true' ? 'Да' : 'Нет'}`);
// Создаем пул подключений
const pool = new Pool(connectionConfig);
async function testConnection() {
    console.log('\nТестирование соединения с базой данных...');
    try {
        // Проверяем соединение
        const client = await pool.connect();
        console.log('✅ Соединение с базой данных установлено успешно');
        // Проверяем версию PostgreSQL
        const versionRes = await client.query('SELECT version()');
        console.log(`📊 Версия PostgreSQL: ${versionRes.rows[0].version}`);
        // Получаем список таблиц
        const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
        console.log(`\n📋 Найдено таблиц: ${tablesRes.rows.length}`);
        if (tablesRes.rows.length > 0) {
            console.log('Список таблиц:');
            tablesRes.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.table_name}`);
            });
            // Для каждой таблицы выводим количество записей
            console.log('\n📈 Статистика таблиц:');
            for (const row of tablesRes.rows) {
                try {
                    const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
                    console.log(`- ${row.table_name}: ${countRes.rows[0].count} записей`);
                }
                catch (err) {
                    console.log(`- ${row.table_name}: ошибка при подсчете записей - ${err.message}`);
                }
            }
        }
        else {
            console.log('\n⚠️ В базе данных нет таблиц. Возможно, нужно выполнить миграции.');
        }
        // Освобождаем соединение
        client.release();
    }
    catch (err) {
        console.error('❌ Ошибка при подключении к базе данных:', err.message);
        console.error('Полная информация об ошибке:', err);
        if (err.code === 'ECONNREFUSED') {
            console.error('Убедитесь, что сервер PostgreSQL запущен и доступен по указанному адресу и порту');
            console.error(`Попробуйте подключиться вручную: psql -h ${connectionConfig.host} -p ${connectionConfig.port} -U ${connectionConfig.user} -d ${connectionConfig.database}`);
        }
        else if (err.code === '28P01') {
            console.error('Неверное имя пользователя или пароль');
        }
        else if (err.code === '3D000') {
            console.error('База данных не существует. Попробуйте создать её командой:');
            console.error(`CREATE DATABASE ${connectionConfig.database};`);
        }
    }
    finally {
        // Закрываем пул соединений
        await pool.end();
    }
}
// Запускаем тест
testConnection();
