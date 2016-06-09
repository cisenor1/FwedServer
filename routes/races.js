'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/races/{season}/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getRaces(request.params.season, request.params.key).then(races => {
                    reply(races);
                });
            }
        }
    }
]