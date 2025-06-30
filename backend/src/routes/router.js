const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const templateModel = require('../models/template');
const contentModel = require('../models/content');

// Page de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Traitement login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findByUsername(username);
  if (user && await userModel.verifyPassword(user, password)) {
    req.session.user = { id: user.id, username: user.username, is_admin: user.is_admin };
    return res.redirect('/backoffice');
  }
  res.render('login', { error: 'Identifiants invalides' });
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Middleware admin
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.is_admin) return next();
  res.redirect('/login');
}

// Backoffice (liste des contenus)
router.get('/backoffice', requireAdmin, async (req, res) => {
  const contents = await contentModel.getAllContents();
  const templates = await templateModel.getAllTemplates();
  res.render('backoffice', { user: req.session.user, contents, templates });
});

// Affichage public d'un contenu
router.get('/display/:id', async (req, res) => {
  const content = await contentModel.getContentById(req.params.id);
  if (!content) return res.status(404).send('Contenu non trouvé');
  const template = await templateModel.getTemplateById(content.template_id);
  if (!template) return res.status(404).send('Template non trouvé');
  res.render('publicDisplay', {
    ...content.data,
    title: content.title,
    templateName: template.name
  });
});

// --- TEMPLATES ---
router.get('/backoffice/template/new', requireAdmin, (req, res) => {
  res.render('templateForm', { formAction: '/backoffice/template/new' });
});

router.post('/backoffice/template/new', requireAdmin, async (req, res) => {
  const { name, mustache_code } = req.body;
  await templateModel.createTemplate(name, mustache_code);
  res.redirect('/backoffice');
});

router.get('/backoffice/template/edit/:id', requireAdmin, async (req, res) => {
  const template = await templateModel.getTemplateById(req.params.id);
  if (!template) return res.redirect('/backoffice');
  res.render('templateForm', {
    edit: true,
    formAction: `/backoffice/template/edit/${template.id}`,
    name: template.name,
    mustache_code: template.mustache_code
  });
});

router.post('/backoffice/template/edit/:id', requireAdmin, async (req, res) => {
  const { name, mustache_code } = req.body;
  await templateModel.updateTemplate(req.params.id, name, mustache_code);
  res.redirect('/backoffice');
});

router.get('/backoffice/template/delete/:id', requireAdmin, async (req, res) => {
  await templateModel.deleteTemplate(req.params.id);
  res.redirect('/backoffice');
});

// --- CONTENTS ---
router.get('/backoffice/content/new', requireAdmin, async (req, res) => {
  const templates = await templateModel.getAllTemplates();
  res.render('contentForm', {
    formAction: '/backoffice/content/new',
    templates
  });
});

router.post('/backoffice/content/new', requireAdmin, async (req, res) => {
  const { title, template_id, data } = req.body;
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (e) {
    const templates = await templateModel.getAllTemplates();
    return res.render('contentForm', {
      formAction: '/backoffice/content/new',
      title,
      templates,
      data,
      error: 'JSON invalide'
    });
  }
  await contentModel.createContent(template_id, title, jsonData);
  res.redirect('/backoffice');
});

router.get('/backoffice/content/edit/:id', requireAdmin, async (req, res) => {
  const content = await contentModel.getContentById(req.params.id);
  if (!content) return res.redirect('/backoffice');
  const templates = await templateModel.getAllTemplates();
  res.render('contentForm', {
    edit: true,
    formAction: `/backoffice/content/edit/${content.id}`,
    title: content.title,
    templates: templates.map(t => ({ ...t, selected: t.id === content.template_id })),
    data: JSON.stringify(content.data, null, 2)
  });
});

router.post('/backoffice/content/edit/:id', requireAdmin, async (req, res) => {
  const { title, template_id, data } = req.body;
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (e) {
    const templates = await templateModel.getAllTemplates();
    return res.render('contentForm', {
      edit: true,
      formAction: `/backoffice/content/edit/${req.params.id}`,
      title,
      templates: templates.map(t => ({ ...t, selected: t.id == template_id })),
      data,
      error: 'JSON invalide'
    });
  }
  await contentModel.updateContent(req.params.id, title, jsonData);
  res.redirect('/backoffice');
});

router.get('/backoffice/content/delete/:id', requireAdmin, async (req, res) => {
  await contentModel.deleteContent(req.params.id);
  res.redirect('/backoffice');
});

module.exports = router;