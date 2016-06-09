'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/drivers/{key?}',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getDrivers(request.params.key).then(drivers => {
                    reply(drivers);
                });
            }
        }
    }
]