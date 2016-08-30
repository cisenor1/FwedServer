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
    },
    {
        method: 'POST',
        path: '/radio/add',
        config: {
            cors: true,
            handler: function (request, reply) {
                if (request.payload){
                    console.log(request.payload);
                    db.addNewRadioMessage(JSON.parse(request.payload.payload)).then((bool)=>{
                        if (bool){
                            reply("{success:true}");
                        }
                    });
                }else{
                    reply("Where's the payload");
                }
            }
        }
    }
]