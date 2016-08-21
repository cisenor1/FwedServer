'use strict';

const bcrypt = require('bcrypt');
const Boom = require('boom');
const base64url = require('base64-url');
const User = require('../models/user');
const createUserSchema = require('../utilities/createUser');
const verifyUniqueUser = require('../utilities/userFunctions').verifyUniqueUser;
const verifyCredentials = require('../utilities/userFunctions').verifyCredentials;
const authenticateUserSchema = require('../utilities/authenticateUserSchema');
const createToken = require('../utilities/token').createToken;
const checkAndDecodeToken = require('../utilities/token').checkAndDecodeToken;
const db = require('../utilities/sqliteUtilities');

function hashPassword(password, cb) {
    // Generate a salt at level 10 strength
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            return cb(err, hash);
        });
    });
}

module.exports = [
    {
        method: 'PUT',
        path: '/users/{key}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;

                // If someone tries to save info for a different user, don't allow it, unless the person saving is an admin
                if (req.params.key !== credentials.key && !isAdmin) {
                    throw Boom.badRequest("cannot save values for a different user")
                }
                
                let newUser = new User();
                newUser.displayName = req.payload.displayName;
                newUser.firstName = req.payload.firstName;
                newUser.lastName = req.payload.lastName;
                newUser.key = req.params.key;
                if (req.payload.newPassword) {
                    newUser.password = hashPassword(req.payload)
                }
                
                if (isAdmin){
                    newUser.role = req.payload.role;
                    newUser.points = req.payload.points;
                }
                
                // Get the existing user out of the database.
                db.getFullUsers(req.params.key).then(users => {
                    let existingUser = users[0];
                    if (!existingUser) {
                        throw Boom.badRequest(new Error("user key provided was not found"));
                    }

                    db.updateUser(newUser).then(updatedUser => {
                        res(updatedUser);
                        return;
                    });
                });
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    },
    {
        method: 'POST',
        path: '/users',
        config: {
            // Before the route handler runs, verify that
            // the user is unique and assign the result to 'user'
            pre: [
                { method: verifyUniqueUser, assign: 'user' }
            ],
            cors: true,
            handler: (req, res) => {
                let user = new User();
                user.email = req.payload.email;
                user.displayName = req.payload.displayName;
                user.role = "user";
                user.key = base64url.encode(user.email);
                user.firstName = req.payload.firstName;
                user.lastName = req.payload.lastName;
                hashPassword(req.payload.password, (err, hash) => {
                    if (err) {
                        throw Boom.badRequest(err);
                    }
                    user.password = hash;
                    db.saveUser(user).then(success => {
                        if (success) {
                            res({
                                id_token: createToken(user),
                                key: user.key
                            }).code(201);
                        }
                        else {
                            throw Boom.badRequest(new Error("unable to save user"));
                        }

                    }).catch(error => {
                        throw Boom.badRequest(error);
                    });
                });
            },
            // Validate the payload against the Joi schema
            validate: {
                payload: createUserSchema
            }
        }
    },
    {
        method: 'POST',
        path: '/users/authenticate',
        config: {
            // Check the user's password against the DB
            pre: [
                {
                    method: verifyCredentials, assign: 'user'
                }],
            cors: true,
            handler: (req, res) => {
                // If the user's password is correct, we can issue a token.
                // If it was incorrect, the error will bubble up from the pre method
                res({
                    id_token: createToken(req.pre.user),
                    key: req.pre.user.key
                }).code(200);
            },
            validate: {
                payload: authenticateUserSchema
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{key?}',
        config: {
            cors: true,
            handler: (req, res) => {
                let credentials = req.auth.credentials;
                let isAdmin = credentials.scope.indexOf('admin') >= 0;
                // If the person is requesting their own info, then they can have it.
                if (req.params.key === credentials.key) {
                    db.getFullUsers(credentials.key).then(users => {
                        if (!users) {
                            throw Boom.badRequest(new Error("user information could not be found"));
                        }
                        var user = users[0];
                        if (!user) {
                            throw Boom.badRequest(new Error("user information could not be found"));
                        }
                        res(user);
                    });
                }
                // If the person requesting information is a 
                else if (isAdmin) {
                    console.log(req.params.key);
                    db.getFullUsers(req.params.key).then(users => {
                        if (req.params.key) {
                            let user = users[0];
                            if (!user) {
                                throw Boom.badRequest(new Error("user key provided was not found"));
                            }
                            res(user);
                            return;
                        }
                        res(users);
                    });
                }
                // They have authenticated, so we'll get them the basic info
                else {
                    db.getBasicUsers(req.params.key).then(users => {
                        if (req.params.key) {
                            let user = users[0];
                            if (!user) {
                                throw Boom.badRequest(new Error("user key provided was not found"));
                            }
                            res(user);
                            return;
                        }
                        res(users);
                    });
                }
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    }
]