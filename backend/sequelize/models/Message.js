const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('message', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        text: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    });
};