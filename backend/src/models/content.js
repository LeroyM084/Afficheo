const pool = require('./database');

async function getAllContents() {
  const res = await pool.query('SELECT * FROM contents');
  return res.rows;
}

async function getContentById(id) {
  const res = await pool.query('SELECT * FROM contents WHERE id = $1', [id]);
  return res.rows[0];
}

async function getContentsByTemplate(template_id) {
  const res = await pool.query('SELECT * FROM contents WHERE template_id = $1', [template_id]);
  return res.rows;
}

async function createContent(template_id, title, data) {
  const res = await pool.query(
    'INSERT INTO contents (template_id, title, data) VALUES ($1, $2, $3) RETURNING *',
    [template_id, title, data]
  );
  return res.rows[0];
}

async function updateContent(id, title, data) {
  const res = await pool.query(
    'UPDATE contents SET title = $2, data = $3, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, title, data]
  );
  return res.rows[0];
}

async function deleteContent(id) {
  await pool.query('DELETE FROM contents WHERE id = $1', [id]);
}

module.exports = {
  getAllContents,
  getContentById,
  getContentsByTemplate,
  createContent,
  updateContent,
  deleteContent
}; 