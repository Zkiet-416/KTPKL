/**
 * Chạy tất cả file SQL trong thư mục backend/database theo thứ tự số (00_, 01_, 02_ ...).
 *   - File bắt đầu bằng "00_" được chạy trên database [master] (để tạo DB).
 *   - Các file còn lại chạy trên database DB_NAME.
 *   - Hỗ trợ tách batch bằng lệnh GO (như SSMS).
 * Dùng:  npm run db:init   (trong thư mục backend)
 */
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const SQL_DIR = path.resolve(__dirname, '../database');

function buildConfig(database) {
  return {
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 1433),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database,
    connectionTimeout: 15000,
    requestTimeout: 60000,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };
}

function splitBatches(content) {
  return content
    .split(/^\s*GO\s*(?:--.*)?$/gim)
    .map((b) => b.trim())
    .filter((b) => b.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().length > 0);
}

async function runFile(file) {
  const database = file.startsWith('00_') ? 'master' : process.env.DB_NAME || 'QuanLyKhoPhuKien';
  const content = fs.readFileSync(path.join(SQL_DIR, file), 'utf8').replace(/^\uFEFF/, '');
  const batches = splitBatches(content);
  const pool = new sql.ConnectionPool(buildConfig(database));
  await pool.connect();
  try {
    for (const batch of batches) {
      await pool.request().batch(batch);
    }
  } finally {
    await pool.close();
  }
  console.log(`  ✔ ${file}  (${batches.length} batch, DB: ${database})`);
}

async function main() {
  if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    console.error('✘ Thiếu DB_USERNAME / DB_PASSWORD. Hãy tạo file .env (ở thư mục gốc) từ .env.example');
    process.exit(1);
  }
  const files = fs
    .readdirSync(SQL_DIR)
    .filter((f) => /^\d+_.*\.sql$/i.test(f))
    .sort();
  if (files.length === 0) {
    console.error(`✘ Không tìm thấy file .sql trong ${SQL_DIR}`);
    process.exit(1);
  }
  console.log(`Chạy script SQL tại ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 1433} ...`);
  for (const file of files) {
    await runFile(file);
  }
  console.log('Hoàn tất khởi tạo database ✔');
}

main().catch((err) => {
  console.error('\n✘ Lỗi khi chạy script SQL:', err.message);
  console.error('  Kiểm tra: SQL Server đã chạy chưa? DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD trong file .env (thư mục gốc) có đúng không?');
  process.exit(1);
});
