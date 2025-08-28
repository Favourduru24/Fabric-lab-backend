require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOption = require('./config/corsOption')
const dbConnc = require('./config/dbConnc')
const helmet = require('helmet')
const {logger, logEvent} = require('./middleware/logger')
const errorMiddleware = require('./middleware/errorHandler')
const PORT = process.env.PORT || 4001
const Redis = require('ioredis')
const {RedisRateLimiter} = require('express-rate-limiter')

//built in middleware
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
// handling cors
app.use(cors(corsOption))
// header protection
app.use(helmet())

// DDos protection and rate limiting.
const redisClient = new Redis(process.env.REDIS_URL)

const rateLimiter = new RedisRateLimiter({
   storeClient: redisClient,
   keyPrefix: 'middleware',
   point: 10,
   duration: 60
})

  app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
   then(() => next())
    .catch((error) => {
    logEvent(`Too Many Requests from this Ip ${req.ip}`, 'rateLimiter.log')
    res.status(429).json({
      success: false,
      message: 'Too many requests'
    })
    }) 
})

// route handlers
app.use(
    '/api/design', 
    (req, res, next) => {
       req.redisClient = redisClient
       next()
    },
    require('./routes/design-routes')
) 

//global error handling
app.use(errorMiddleware)
app.use(logger)

// database calling
dbConnc()
app.listen(PORT, () => {
console.log(`Design service server running on port ${PORT}`) 
})