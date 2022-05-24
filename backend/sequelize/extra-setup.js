function applyExtraSetup(sequelize) {
    const { user, message, token } = sequelize.models;
    user.hasMany(message);
    user.hasMany(token);
    message.belongsTo(user);
    token.belongsTo(user);
}

module.exports = { applyExtraSetup };