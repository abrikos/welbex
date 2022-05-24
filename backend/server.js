require('dotenv').config();
console.log(process.env.TEST)
const express = require( "express");
const bodyParser = require( "body-parser");
const cookieParser = require('cookie-parser');
const sequelize = require('./sequelize');
const router = require('./router')

const portWeb = process.env.API_PORT || 4000;
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
router(app);

async function assertDatabaseConnectionOk() {
    console.log(`Checking database connection...`);
    try {
        await sequelize.authenticate();
        console.log('Database connection OK!');
    } catch (error) {
        console.log('Unable to connect to the database:');
        console.log(error.message);
        process.exit(1);
    }
}

async function init() {
    await assertDatabaseConnectionOk();
    app.listen(portWeb, () => {
        console.log(`server started at http://localhost:${portWeb}`);
    });
}

init()
