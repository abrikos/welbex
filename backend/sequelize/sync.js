require('dotenv').config();
const sequelize = require('./index');


async function syncDB() {
    console.log(`Checking database connection...`);
    try {
        await sequelize.authenticate();
        console.log('Database connection OK!');
        await sequelize.sync({ force: true });
    } catch (error) {
        console.log('Unable to connect to the database:');
        console.log(error.message);
        process.exit(1);
    }
}

syncDB()