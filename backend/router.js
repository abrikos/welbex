const sequelize = require('./sequelize');
const passport = require('./passport');
const fs = require('fs');
const uploadDir = './upload';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
module.exports = function (app) {

    function catcher(e, res) {
        console.log(e)
        if (e.status)
            res.status(e.status).send(e)
        else
            res.status(500).send({message: e.message})
    }

    async function moveFile(f, post) {
        console.log(f)
        console.log({postId: post.id, ...f})
        const file = await sequelize.models.image.create({messageId: post.id, ...f})
        console.log(file.path)
        f.mv('.' + file.path)
    }

    /**
     * @swagger
     * /api/post/create:
     *   post:
     *     summary: Create a message
     *     description: Text and files acceptable
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               text:
     *                 type: string
     *                 description: Body of message
     *                 example: some long text
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     */
    app.post('/api/post/create', passport.isLogged, async (req, res) => {
        const {user} = res.locals;
        const post = req.body.text && await sequelize.models.message.create({userId: user.id, text: req.body.text})
        if (post && req.files) {
            if (req.files.images.length) {
                for (const f of req.files.images) {
                    moveFile(f, post)
                }
            } else {
                moveFile(req.files.images, post)
            }
        }
        res.send({});
    })

    /**
     * @swagger
     * /api/post/:id/update:
     *   post:
     *     summary: Update message
     *     description: Text and files acceptable
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     */
    app.post('/api/post/:id/update', passport.isLogged, async (req, res) => {
        try {
            if (!req.body.text) throw {status: 406, message: 'Empty text'}
            const {user} = res.locals;
            const post = await sequelize.models.message.findByPk(req.params.id)
            if (post.userId !== user.id) throw {status: 403, message: 'Access denied'}
            if (!post) throw {status: 404, message: 'message not found'}
            post.text = req.body.text;
            await post.save()
            if (req.files) {
                if (req.files.images.length) {
                    for (const f of req.files.images) {
                        moveFile(f, post)
                    }
                } else {
                    moveFile(req.files.images, post)
                }
            }
            res.send({});
        } catch (e) {
            catcher(e, res)
        }
    })

    /**
     * @swagger
     * /api/post/list:
     *  post:
     *     summary: List of messages
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   text:
     *                     type: string
     *                   user:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: number
     *                       username:
     *                         type: string
     *                   images:
     *                      type: array
     *                      items:
     *                        type: object
     *                        properties:
     *                          id:
     *                            type: number
     *                          path:
     *                            type: string
     */

    app.post('/api/post/list', async (req, res) => {
        const list = await sequelize.models.message.findAll({
            include: [
                {model: sequelize.models.user, as: 'user', attributes: ['username', 'id']},
                {model: sequelize.models.image, as: 'images'},
            ],
            order: [
                ['createdAt', 'DESC'],
            ],
        })
        res.send(list);
    })

    /**
     * @swagger
     * /api/upload/:file:
     *   delete:
     *     summary: View uploaded image
     *     description: By file name
     *     parameters:
     *       - in: path
     *         name: file
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     */


    app.get('/api/upload/:file', (req, res) => {
        console.log(req.params.file)
        res.sendFile(uploadDir +'/' + req.params.file, {root: '.'});
    })

    /**
     * @swagger
     * /api/post/:id/delete:
     *   delete:
     *     summary: Delete message
     *     description: Destroy
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */

    app.delete('/api/post/:id/delete', passport.isLogged, async (req, res) => {
        try {
            const {user} = res.locals;
            const message = await sequelize.models.message.findByPk(req.params.id)
            if (!message) throw {status: 404, message: 'Message not found'}
            if (message.userId !== user.id) throw {status: 403, message: 'Access denied'}
            await message.destroy()
            res.send({});
        } catch (e) {
            catcher(e, res)
        }
    })

    /**
     * @swagger
     * /api/image/:id/delete:
     *   delete:
     *     summary: Delete image
     *     description: Destroy
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */

    app.delete('/api/image/:id/delete', passport.isLogged, async (req, res) => {
        try {
            const {user} = res.locals;
            const img = await sequelize.models.image.findByPk(req.params.id, {include: [sequelize.models.message]})
            if (!img) throw {status: 404, message: 'Image not found'}
            if (img.message.userId !== user.id) throw {status: 403, message: 'Access denied'}
            fs.unlinkSync('.' + img.path)
            await img.destroy()
            res.send({});
        } catch (e) {
            catcher(e, res)
        }
    })

    /**
     * @swagger
     * /api/user/view:
     *   post:
     *     summary: View user
     *     description: if logged
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: number
     *                 username:
     *                   type: string
     */

    app.post('/api/user/view', passport.isLogged, (req, res) => {
        const {user} = res.locals;
        res.send(user);
    })

    /**
     * @swagger
     * /api/user/logout:
     *   post:
     *     summary: Logout user
     *     description: if logged
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */
    app.post('/api/user/logout', passport.isLogged, (req, res) => {
        passport.methods.logout(req, res)
    })

    /**
     * @swagger
     * /api/user/login:
     *   post:
     *     summary: Login user
     *     responses:
     *       200:
     *         description: Empty
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */

    app.post('/api/user/login', async (req, res) => {
        try {
            const user = await passport.methods.authenticate(req, res);
            if (!user) throw {status: 401, message: 'login failed'}
            res.send(user)
        } catch (e) {
            catcher(e, res)
        }
    })

    app.post('/api/user/signup', async (req, res) => {
        try {
            const {username, password, password2} = req.body;
            if (password !== password2) throw {status: 406, message: 'password != confirmation'};
            console.log(req.body)
            const found = await sequelize.models.user.findOne({where: {username}});
            if (found) throw {status: 406, message: `user ${username} exists`};

            await sequelize.models.user.create({username, password});
            const user = await passport.methods.authenticate(req, res);
            res.send(user);
        } catch (e) {
            catcher(e, res)
        }
    })

}