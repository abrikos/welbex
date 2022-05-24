const {DataTypes} = require('sequelize');
const md5 = require("md5");


module.exports = (sequelize) => {
    const Model = sequelize.define('image', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
        },
        mimetype: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        basename: {
            type: DataTypes.VIRTUAL,
            get() {
                return md5(this.id)
            }
        },
        filename: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.basename + '.' + this.extension
            }
        },
        types: {
            type: DataTypes.VIRTUAL,
            get() {
                return  this.mimetype.match(/(.*)\/(.*)/)
            }
        },
        extension: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.types[2]
            }
        },
        path: {
            type: DataTypes.VIRTUAL,
            get() {
                return '/upload/' + this.filename
            }
        },

    });
    Model.prototype.checkPassword = function (password) {
        return this.password === md5(password)
    };
};