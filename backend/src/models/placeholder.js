const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Placeholder = sequelize.define('Placeholder', {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['title','text', 'image']] // Allowed types
        }
    },
    templateId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'templates', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    },
})

module.exports = Placeholder;