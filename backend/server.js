require('dotenv').config();
console.log(process.env.TEST)
const express = require( "express");
const bodyParser = require( "body-parser");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const sequelize = require('./sequelize');
const router = require('./router')
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express");

const portWeb = process.env.API_PORT || 4000;
const app = express();
app.use(express.static('upload'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

router(app);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Test exercise for WelbeX",
            version: "0.1.0",
            description:
                "by Artem Filippow",
            contact: {
                name: "Abrikos",
                url: "https://abrikos.pro",
                email: "me@abrikos.pro",
            },
        },
        servers: [
            {
                url: "http://localhost:3000/",
                description: 'Development server',
            },
            {
                url: "http://localhost:4000/",
                description: 'Backend server',
            },
        ],
    },
    apis: ["./backend/router.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);
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
