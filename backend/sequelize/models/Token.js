const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('token', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
        }
    });
};