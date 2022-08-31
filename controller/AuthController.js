const User = require('../model/User');

module.exports = {
    show: (req, res) => {
        res.render('auth', {
            authenticated: req.session.authenticated,
            csrfToken: req.csrfToken()
        });
    },
    authenticate: (req, res) => {
        const body = req.body;
        if (body.lineid && body.name) {
            User.getUser(body.lineid).then((users) => {
                if (users.length > 0) {
                    req.session.authenticated = true;
                    req.session.user = {
                        id: users[0].id,
                        name: body.name,
                        photo: body.photo
                    };
                    req.session.alert =
                    {
                        action: 'login',
                        type: 'success',
                        message: 'Logged in.'
                    }


                    return res.redirect('/');
                } else {
                    req.session.alert = {
                        action: 'login',
                        type: 'error',
                        message: 'Please register.'
                    };
                }
            });
        }

    },
    logout: (req, res) => {
        req.session.destroy();
        res.render('logout', {
            csrfToken: req.csrfToken()
        });
    }
};