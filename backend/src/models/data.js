const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Data = sequelize.define('Data', {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['text', 'image']] // Allowed types
        }
    },
    content: {
        type: DataTypes.BLOB('long'), // Use BLOB for large text or binary data ( image in binary )
        allowNull: false
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'events', // Correction ici : nom de la table
            key: 'id' // Key in the referenced table
        }
    }
}, {
    tableName: 'data',
    timestamps: false
});

module.exports = Data;