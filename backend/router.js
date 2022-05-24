const sequelize = require('./sequelize');
const passport = require('./passport');


module.exports = function (app) {
    app.post('/api/post/create', passport.isLogged, async (req, res) => {
        const {user} = res.locals;
        await sequelize.models.message.create({userId: user.id, text: req.body.text})
        res.send({});
    })

    app.post('/api/post/list', async (req, res) => {
        const list = await sequelize.models.message.findAll({
            include: [{model: sequelize.models.user, as: 'user', attributes: ['username']}],
            order: [
                ['createdAt'],
            ],
        })
        res.send(list);
    })

    app.post('/api/get/user', passport.isLogged, (req, res) => {
        const {user} = res.locals;
        res.send(user);
    })

    app.post('/api/logout', passport.isLogged, (req, res) => {
        passport.methods.logout(req, res)
    })

    app.post('/api/login', async (req, res) => {
        try {
            const user = await passport.methods.authenticate(req, res);
            if (!user) throw {status: 401, message: 'login failed'}
            res.send(user)
        } catch (e) {
            console.log(e)
            if (e.status)
                res.status(500).send(e)
            else
                res.status(500).send({message: e.message})
        }
    })

    app.post('/api/signup', async (req, res) => {
        try {
            const {username, password, password2} = req.body;
            if (password !== password2) res.status(406).send({message: 'password != confirmation'});
            const found = await sequelize.models.user.findOne({where: {username}});
            if (found) throw {status: 406, message: `user ${username} exists`};
            await sequelize.models.user.create({username, password});
            const user = await passport.methods.authenticate(req, res);
            res.send(user);
        } catch (e) {
            console.log(e)
            res.status(e.status || 500).send(e)
        }
    })

}