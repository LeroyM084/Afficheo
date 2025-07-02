const Role = require('./user/Role');
const User = require('./user/user');
const Category = require('./category');
const Template = require('./template');
const Event = require('./event');
const Data = require('./data');
const Placeholder = require('./placeholder');
const Setting = require('./setting');

// Synchronise tous les modèles dans l'ordre des dépendances
async function syncAll() {
    try {
        await Role.sync({ alter: true });
        await User.sync({ alter: true });
        await Category.sync({ alter: true });
        await Template.sync({ alter: true });
        await Event.sync({ alter: true });
        await Data.sync({ alter: true });
        await Placeholder.sync({ alter: true });
        await Setting.sync({ alter: true });
        console.log('All models synchronized!');
        process.exit(0);
    } catch (err) {
        console.error('Error synchronizing models:', err);
        process.exit(1);
    }
}

syncAll();