const Mustache = require('mustache');
const { Event, Data, Template, Placeholder, Category, User } = require('../models');

// Génère tous les slides HTML à partir des events, templates, placeholders et data
const generateAllTemplates = async (req, res) => {
    try {
        // 1. Récupérer tous les events
        const events = await Event.findAll();

        const slides = [];

        for (const event of events) {
            // 2. Récupérer le template associé à l'event
            const template = await Template.findByPk(event.templateId);
            if (!template) continue;

            // 3. Récupérer les placeholders du template
            const placeholders = await Placeholder.findAll({
                where: { templateId: template.id }
            });

            // 4. Récupérer les data associées à l'event
            const datas = await Data.findAll({
                where: { eventId: event.id }
            });

            // 5. Construire le contexte pour Mustache
            const context = {};
            for (const placeholder of placeholders) {
                // Cherche la data qui correspond au type du placeholder
                const dataItem = datas.find(d => d.type === placeholder.type);
                if (dataItem) {
                    // Si c'est une image, convertir le buffer en base64
                    if (dataItem.type === 'image') {
                        context[placeholder.type] = `data:image/png;base64,${dataItem.content.toString('base64')}`;
                    } else {
                        context[placeholder.type] = dataItem.content.toString();
                    }
                } else {
                    context[placeholder.type] = '';
                }
            }

            // 6. Générer le HTML avec Mustache
            const html = Mustache.render(template.HTML, context);

            slides.push({
                eventId: event.id,
                categoryId: event.categoryId,
                html,
                css: template.CSS
            });
        }

        return res.json({ slides });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de la génération des slides.' });
    }
};

module.exports = {