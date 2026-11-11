const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');

const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL + '?sslmode=require';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      balance BIGINT DEFAULT 0,
      energy INT DEFAULT 1000,
      level INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Database tayyor!");
}
initDB();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  let res = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
  if (res.rows.length === 0) {
    await pool.query('INSERT INTO users (telegram_id) VALUES ($1)', [userId]);
    res = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
  }

  const user = res.rows[0];
  bot.sendMessage(chatId, `UzCoin botiga xush kelibsiz! 🚀\n\n💰 Balans: ${user.balance} COIN\n⚡ Energiya: ${user.energy}/1000`);
});
