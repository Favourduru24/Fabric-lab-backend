const allowedOrigin = require('../config/allowedOrigin')

 const corsOption = {
     origin: (origin, callback) => {
         if(!origin || allowedOrigin.includes(origin) !== -1) {
            callback(null, true)
         } else {
             callback(new Error('Not allowed by CORS!'))
         }
     },
      credentials: true,  // ✅ This is crucial for allowing credentials
    optionsSuccessStatus: 204,  // Some legacy browsers choke on 204
 }

 module.exports = corsOption