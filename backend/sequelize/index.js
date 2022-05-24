const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');

if(!process.env.MYSQL_CONNECT) {
    console.warn('process.env.MYSQL_CONNECT must be set');
    process.exit(1)
}

const sequelize = new Sequelize('mysql://' + process.env.MYSQL_CONNECT);

const modelDefiners = [
    require('./models/User'),
    require('./models/Message'),
    require('./models/Token'),
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
}

applyExtraSetup(sequelize);

module.exports = sequelize;