const sequelize = require('./sequelize');
const md5 = require('md5')
const moment = require('moment')
const cookieName = 'jwtSecure'

const methods = {
    async getUser(req) {
        if (!req.cookies[cookieName]) return;
        const name = req.cookies[cookieName];
        const token = await sequelize.models.token.findOne({
            include: [{model: sequelize.models.user, as: 'user'}],
            where: {name}
        })
        if (!token) return
        return token.user;
    },

    async authenticate(req, res) {
        let user;
        const {strategy, username, password} = req.body;
        if (strategy === 'google') {
            user = await this.googleStrategy(req);
        } else {
            user = await this.passwordStrategy(username, password);
        }
        if (!user) return;
        const token = await sequelize.models.token.create({userId: user.id, name: md5(moment().unix())});
        res.cookie(cookieName, token.name, {
            secure: true,
            //secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            expires: new Date(moment().add(30, 'days').toISOString()),
        });
        return user;
    },

    async logout(req, res) {
        const token = await sequelize.models.token.findOne({where: {name: req.cookies[cookieName]}});
        if (!token) return;
        token.destroy();
        res.clearCookie(cookieName);
        res.end();
    },

    googleStrategy() {
        console.log(this)
    },

    async passwordStrategy(username, password) {
        const user = await sequelize.models.user.findOne({where: {username}});
        if(!user) return
        if (user.checkPassword(password)) {
            return user
        }
    }
}

async function isLogged(req, res, next) {
    const found = await methods.getUser(req);
    if (!found) return res.status(401).send({status: 401, message: 'Must be logged user'})
    res.locals.user = found;
    return next()
}


module.exports = {methods, isLogged}