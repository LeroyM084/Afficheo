const pool = require('./database');

async function getAllTemplates() {
  const res = await pool.query('SELECT * FROM templates');
  return res.rows;
}

async function getTemplateById(id) {
  const res = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
  return res.rows[0];
}

async function createTemplate(name, mustache_code) {
  const res = await pool.query(
    'INSERT INTO templates (name, mustache_code) VALUES ($1, $2) RETURNING *',
    [name, mustache_code]
  );
  return res.rows[0];
}

async function updateTemplate(id, name, mustache_code) {
  const res = await pool.query(
    'UPDATE templates SET name = $2, mustache_code = $3 WHERE id = $1 RETURNING *',
    [id, name, mustache_code]
  );
  return res.rows[0];
}

async function deleteTemplate(id) {
  await pool.query('DELETE FROM templates WHERE id = $1', [id]);
}

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
}; 