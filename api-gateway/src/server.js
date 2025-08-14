require('dotenv').config()
const express = require('express')
const app = express()
const proxy = require('express-http-proxy')
const helmet = require('helmet')
const cors = require('cors')
const corsOption = require('./config/corsOption')
const PORT = process.env.PORT || 4000
const errorMiddleware = require('./middleware/errorHandler')
const {authMiddleware} = require('./middleware/auth-middleware')
const {logger} = require('./middleware/logger')


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors(corsOption))
app.use(helmet())
app.use(logger)


//proxy option ::
 const proxyOptions = {
     proxyReqPathResolver: (req) => {
         return req.originalUrl.replace(/^\/v1/, '/api')
     },

     proxyErrorHandler: (err, res, next) => {
       res.status(500).json({
        message: 'Internal proxy server error', error: err.message
       })
     }
 }
 
//   Ko0uc6Eo3OXfJXhM
  app.use('/v1/media', 
    authMiddleware,
    proxy(process.env.UPLOAD_SERVICE, ({
     ...proxyOptions,
     parseReqBody: false
  })))

  // app.use('/v1/design',
  //  //   authMidddleware,
  //    proxy(process.env.DESIGN_SERVICE, ({
  //    ...proxyOptions,
  //    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  //       proxyReqOpts.headers["Content-Type"] = "application/json"
  //       return proxyReqOpts
  //   },
  //   userResDecorator: (proxyRes, proxyResData, userReq) => {
  //       console.log(`Response recieved from identity service: ${proxyRes.statusCode}`)
  //       return proxyResData
  //   }
  // })))

  app.use(
    '/v1/design',
     authMiddleware,
      proxy(process.env.DESIGN_SERVICE, {
    ...proxyOptions,
  }))

  app.use('/v1/subscription',
     authMiddleware, 
    proxy(process.env.SUBSCRIPTION_SERVICE, ({
     ...proxyOptions,
  })))

  app.use(errorMiddleware)

app.listen(PORT, () => {
console.log(`Api-gateway service server running on port ${PORT}`)
})