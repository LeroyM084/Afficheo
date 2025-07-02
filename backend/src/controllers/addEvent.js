const { Event, Data, Template, Category } = require('../models');
const { Op } = require('sequelize');

// Ce fichier permet d'ajouter un nouvel évent à la base de données 

const addEvent = async (req,res ) => {
    const userId = req.user.id;
    const data = req.body;

    try {
        if (!data || !data.category || !data.template || !data.data) {
            return res.status(400).json({ message: 'Bad request' });
        };

        const category = Category.findOne({
            where : {
                name : data.category
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { addEvent };