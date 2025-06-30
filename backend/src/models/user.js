const pool = require('./database');
const bcrypt = require('bcrypt');

async function findByUsername(username) {
  const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
}

async function createUser(username, password, is_admin = false) {
  const hash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, $3) RETURNING *',
    [username, hash, is_admin]
  );
  return res.rows[0];
}

async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password_hash);
}

module.exports = { findByUsername, createUser, verifyPassword }; 