const allowedOrigin = require('../config/allowedOrigin')

 const corsOption = {
     origin: (origin, callback) => {
         if(!origin || allowedOrigin.includes(origin) !== -1) {
            callback(null, true)
         } else {
             callback(new Error('Not allowed by CORS!'))
         }
     },
     optionSuccessStatus: 204,
 }

 module.exports = corsOption