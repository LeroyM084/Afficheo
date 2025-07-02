const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'templates', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    },
createdBy : {
    userId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    }
}}, {
    tableName: 'events',
    timestamps: false
});

module.exports = Event;