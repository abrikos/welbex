const {DataTypes} = require('sequelize');
const md5 = require("md5");


module.exports = (sequelize) => {
    const Model = sequelize.define('user', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            set(value) {
                this.setDataValue('password', md5(value))
            }
        },

    });
    Model.prototype.checkPassword = function (password) {
        return this.password === md5(password)
    };
};