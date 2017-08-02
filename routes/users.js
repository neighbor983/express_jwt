const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user');

const UserNameUsedMessage = {
    success: false,
    msg: 'Someone is already using that username. ' +
        'Please choose a different one.'
};
const EmailUsedMessage = {
    success: false,
    msg: 'Account already exist using this email address.'
};
const regirstrationSuccessMessage = {
    success: true,
    msg: 'You were registered successfully.'
};
const serverErrorMessage = {
    success: false,
    msg: 'We were unable to register now.'
};
const userNotFoundErrorMessage = {
    success: false,
    msg: 'User not found.'
};
const invalidPasswordErrorMessage = {
    success: false,
    msg: 'Invalid Password.'
};


function createUser(requestBody) {
    let newUser = new User({
        name: requestBody.name,
        email: requestBody.email,
        username: requestBody.username,
        password: requestBody.password

    });
    return newUser;
}

function createJwtToken(user, token) {
    let jwtToken = {    success: true,
                        token: 'JWT ' + token,
                        user: {
                            id: user._id,
                            name: user.name,
                            username: user.username,
                            email: user.email
                        }
                    };
    return jwtToken;
}

//Register
router.post('/register', (req, res, next) => {

    let newUser = createUser(req.body);

    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) throw err;

        if (user) {
            return res.json(UserNameUsedMessage);
        }

        User.getUserByEmail(newUser.email, (err, user) => {
            if (err) throw err;

            if (user) {
                return res.json(EmailUsedMessage);
            }

            User.addUser(newUser, (err, user) => {
                if (err) {
                    res.json(serverErrorMessage);
                }

                res.json(regirstrationSuccessMessage);

            });
        });
    });
});

//Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json(userNotFoundErrorMessage);
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
                const token = jwt.sign(user, process.env.JWT_SECRET, {
                    expiresIn: 604800 //1 week
                });
                res.json( createJwtToken(user, token) );
            }
            else {
                return res.json(invalidPasswordErrorMessage);
            }
        });
    });
});

//Profile
router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    res.json({
        user: req.user
    });
});

module.exports = router;