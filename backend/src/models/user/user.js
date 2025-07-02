const sequelize = require ('../database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20] // Username must be between 3 and 20 characters
        }
    },
    password : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 500] // Password must be at least 6 characters long
        }
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Valid email format
        }
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles', // Name of the referenced table
            key: 'id' // Key in the referenced table
        }
    }
}, {
    tableName: 'users',
    timestamps: false   
})

module.exports = User;