const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.sequelize_HOST || 'localhost',
    database: process.env.sequelize_DATABASE || 'afficheo',
    username: process.env.sequelize_USER || 'postgres',
    password: 'salope',
    logging: false, // Disable logging for cleaner output
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
