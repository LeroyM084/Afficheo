// Patches
const {inject, errorHandler} = require('express-custom-error');
inject(); // Patch express in order to use async / await syntax

// Require Dependencies

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const logger = require('./util/logger');

// Load .env Enviroment Variables to process.env

require('mandatoryenv').load([
    'DB_HOST',
    'DB_DATABASE',
    'DB_USER',
    'DB_PASSWORD',
    'PORT',
    'SECRET'
]);

const { PORT } = process.env;

// Instantiate an Express Application
const app = express();

// Configure Express App Instance
// app.use(express.json( { limit: '50mb' } ));
app.use(express.urlencoded( { extended: true, limit: '10mb' } ));

// Configure custom logger middleware
app.use(logger.dev, logger.combined);

app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(express.static(path.join(__dirname, '../public')));

// This middleware adds the json header to every response
// app.use('*', (req, res, next) => {
//    res.setHeader('Content-Type', 'application/json');
//    next();
//})

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false
}));

// Assign Routes
const router = require('./routes/router');
app.use('/', router);

// ===> Place ta route ici
app.get('/frontpage', async(req, res) => {
    res.render('frontpage', {
        title: 'Welcome to the Frontpage',
        message: 'This is the frontpage of our application. Enjoy your stay!'
    });
})

// Handle errors
app.use(errorHandler());

// Handle not valid route
app.use('*', (req, res) => {
    res
    .status(404)
    .json( {status: false, message: 'Endpoint Not Found'} );
})

// Open Server on selected Port
app.listen(
    PORT,
    () => console.info('Server listening on port ', PORT)
);