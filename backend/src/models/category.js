const sequelize = require('./database');
const { Sequelize } = require('sequelize');

const Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }}, {
    tableName: 'categories',
    timestamps: false
});

module.exports = Category;