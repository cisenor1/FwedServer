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
                    let p = decodeURIComponent(request.payload.payload);
                    console.log(p);
                    let o = JSON.parse(p);
                    console.log(o);
                    db.addNewRadioMessage(o).then((bool)=>{
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