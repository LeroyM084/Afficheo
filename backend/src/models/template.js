const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Template = sequelize.define('Template', {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    HTML : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    CSS : {
        type: DataTypes.TEXT,
        allowNull: false
    }}, {
    tableName: 'templates',
    timestamps: false   
    }
)

module.exports = Template;