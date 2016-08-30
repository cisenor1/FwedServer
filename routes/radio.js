'use strict';

const db = require('../utilities/sqliteUtilities');

module.exports = [
    {
        method: 'GET',
        path: '/radio',
        config: {
            cors: true,
            handler: function (request, reply) {
                db.getLatestRadioMessage().then((latestMessage) => {
                    if (latestMessage) {
                        reply(latestMessage);
                    }
                });  
            }
        }
    }
]