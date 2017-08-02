const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;
const users = require('./routes/users');

//Connect to MongoDB
const dbConnectionString = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@'+process.env.DB_MACHINE+':'+process.env.DB_PORT+'/'+process.env.DB_NAME;
mongoose.connect(dbConnectionString);

//On Connected
mongoose.connection.on('connected', () => {
    console.log('Connected to database: ', dbConnectionString);
});

//On Error
mongoose.connection.on('error', (err) => {
    console.log('Database Error: ', err);
});

app.use(logger('dev'));

app.use(cors());

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use('/users', users);

app.get('/', (req, res) => {
    res.send("");
});

app.listen(port, () => {
    console.log("Server started on port: ", port);
});