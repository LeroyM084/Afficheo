const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Setting = sequelize.define('Setting', {
    delay : {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60, // Default delay in seconds
        validate: {
            min: 1 // Minimum delay of 1 second
        }
    },
    bg_image : {
        type : DataTypes.BLOB,
        allowNull: true,
    }
    }, {
    tableName: 'settings',
    timestamps: false
})

module.exports = Setting;