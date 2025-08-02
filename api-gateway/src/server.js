require('dotenv').config()
const express = require('express')
const proxy = require('express-http-proxy')
const app = exxpress()
const helmet = require('helmet')
const cors = require('cors')
const corsOption = require('./config/corsOption')
const PORT = process.env.PORT || 4000


app.use(cors(corsOption))
app.use(express.json())
app.use(helmet())



app.listen(PORT, () => {
console.log(`Api-gateway service server running on port ${PORT}`) 
})

//proxy option ::

 const proxyOptions = {
     proxyReqPathResolver: (req) => {
         return req.originalUrl.replace(/^\/v1/, '/api')
     },

     proxyErrorHandler: (err, res, next) => {
       res.status(500).json({
        message: 'Internal proxy error.',
        error: err.message
       })
     }
 }
  app.use('/v1/media', proxy(process.env.UPLOAD_SERVICE, ({
    
  })))