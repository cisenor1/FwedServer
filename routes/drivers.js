'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getDrivers(false, request.params.key).then(drivers => {
                    reply(drivers);
                });
            }
        }
    },
    {
        method: 'GET',
        path: '/drivers/active/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getDrivers(true, request.params.key).then(drivers => {
                    reply(drivers);
                });
            }
        }
    }
]