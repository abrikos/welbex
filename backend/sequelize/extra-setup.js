function applyExtraSetup(sequelize) {
    const { user, message, token, image } = sequelize.models;
    image.belongsTo(message);
    message.belongsTo(user);
    token.belongsTo(user);
    user.hasMany(message);
    user.hasMany(token);
    message.hasMany(image);

}

module.exports = { applyExtraSetup };