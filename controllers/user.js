const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    //hasher le mdp 
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'utilisateur créé' }))
                .catch(error => {
                    console.log(error);
                    res.status(400).json({ error })
                });
        })
        .catch(error => res.status(500).json({ error }));
    //enregistrer le user dans la BDD
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'Adresse mail ou mdp incorrect' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'Adresse mail ou mdp incorrect' })
                        } else {
                            res.status(200).json({
                                userID: user._id,
                                token: jwt.sign({ userID: user._id },
                                    'RANDOM_TOKEN_SECRET', { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error });
                    })
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};