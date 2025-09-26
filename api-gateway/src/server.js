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
const rateLimit = require('express-rate-limit')


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors(corsOption))
app.use(helmet())
app.use(logger)


const routeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 100, // Limit each IP to 10 requests per `window` per 15 minute
    message:
        { message: 'Too many request from this IP, please try again after a 60 second pause' },
    handler: (req, res, next, options) => {
        logEvent(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}\t`, 'rateLimiter.log')
        res.status(options.statusCode).send(options.message)
        next()
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// app.use(routeLimiter)

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

    app.use('/v1/media', 
    authMiddleware,
    proxy(process.env.UPLOAD_SERVICE, {
    ...proxyOptions,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        if(!srcReq.headers['content-type']?.startsWith('multipart/form-data')){
           proxyReqOpts.headers["Content-Type"] = "application/json"  
        }
        return proxyReqOpts
    },
       userResDecorator: (proxyRes, proxyResData, userReq) => {
        console.log(`Response recieved from media service: ${proxyRes.statusCode}`)
        return proxyResData
    },
    parseReqBody: false
   }))

//   app.use('/v1/design',
//      authMiddleware,
//      proxy(process.env.DESIGN_SERVICE, ({
//      ...proxyOptions,
//      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//         proxyReqOpts.headers["Content-Type"] = "application/json"
//         return proxyReqOpts
//     },
//     userResDecorator: (proxyRes, proxyResData, userReq) => {
//         console.log(`Response recieved from design service: ${proxyRes.statusCode}`)
//         return proxyResData
//     }
//   })))

//   app.use('/v1/subscription',
//      authMiddleware,
//      proxy(process.env.SUBSCRIPTION_SERVICE, ({
//      ...proxyOptions,
//      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//         proxyReqOpts.headers["Content-Type"] = "application/json"
//         return proxyReqOpts
//     },
//     userResDecorator: (proxyRes, proxyResData, userReq) => {
//         console.log(`Response recieved from subcription service: ${proxyRes.statusCode}`)
//         return proxyResData
//     }
//   })))

  app.use('/v1/subscription',
     authMiddleware, 
    proxy(process.env.SUBSCRIPTION_SERVICE, ({
     ...proxyOptions,
  })))

  app.use(
    '/v1/design',
     authMiddleware,
      proxy(process.env.DESIGN_SERVICE, {
    ...proxyOptions,
  }))

  //  app.use('/v1/media', 
  //   authMiddleware,
  //   proxy(process.env.UPLOAD_SERVICE, ({
  //    ...proxyOptions,
  //    parseReqBody: false
  // })))

  app.use(errorMiddleware)

app.listen(PORT, () => {
console.log(`Api-gateway service server running on port ${PORT}`)
})