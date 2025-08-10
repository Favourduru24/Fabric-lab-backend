require('dotenv').config()
const express = require('express')
const proxy = require('express-http-proxy')
const app = express()
const helmet = require('helmet')
const cors = require('cors')
const corsOption = require('./config/corsOption')
const PORT = process.env.PORT || 4000
const authMidddleware = require('./middleware/auth-middleware')


app.use(helmet())
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({extended: true}))


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
     authMidddleware,
     ...proxyOptions,
     parseReqBody: false
  })))

  app.use('/v1/design',
     authMidddleware,
     proxy(process.env.DESIGN_SERVICE, ({
     ...proxyOptions,
  })))

  app.use('/v1/subscription',
     authMidddleware, 
    proxy(process.env.SUBSCRIPTION_SERVICE, ({
     ...proxyOptions,
  })))

app.listen(PORT, () => {
console.log(`Api-gateway service server running on port ${PORT}`)
})