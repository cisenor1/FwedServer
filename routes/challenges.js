'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/challenges/{season}/{raceKey}/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getChallenges(request.params.season, request.params.raceKey, request.params.key).then(challenges => {
                    reply(challenges);
                });
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    },
    {
        method: 'GET',
        path: '/challenges/{season}/{raceKey}/{userKey}/picks/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                let credentials = request.auth.credentials;
                if (request.params.userKey !== credentials.key) {
                    throw Boom.badRequest(new Error("cannot request picks for different user"));
                }
                db.getUserPicks(request.params.userKey, request.params.season, request.params.raceKey, request.params.key).then(picks => {
                    reply(picks);
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
        path: '/challenges/{season}/{raceKey}/{userKey}/picks',
        config: {
            cors: true,
            handler: (request, reply) => {
                let credentials = request.auth.credentials;
                if (request.params.userKey !== credentials.key) {
                    throw Boom.badRequest(new Error("cannot save picks for different user"));
                }
                let picks = [];
                let season = parseInt(request.params.season);
                let raceKey = request.params.raceKey;
                let userKey = request.params.userKey;
                if (request.payload) {
                    let restUserPicks = JSON.parse(request.payload);
                    console.log(restUserPicks);
                    if (restUserPicks.length) {
                        restUserPicks.forEach(cdm => {
                            var pick = {
                                season: season,
                                raceKey: raceKey,
                                userKey: userKey,
                                challengeKey: cdm.key,
                                choice: cdm.value
                            };
                            picks.push(pick);
                        });
                        db.saveUserPicks(picks).then(success => {
                            reply(success).code(200);
                        });
                    }
                    else {
                        throw Boom.badRequest(new Error("no valid picks given to save"));
                    }
                }
                else {
                    throw Boom.badRequest(new Error("no valid picks given to save"));
                }
            },
            auth: {
                strategy: 'jwt',
                scope: ['user']
            }
        }
    }
]