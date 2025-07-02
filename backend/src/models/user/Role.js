const sequelize = require('../database');
const { DataTypes } = require('sequelize');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isIn: [['admin', 'user', 'guest']] // Allowed roles
        }
    }
}, {
    tableName: 'roles',
    timestamps: false
}); 

module.exports = Role;