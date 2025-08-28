const rateLimit = require('express-rate-limit')
const { logEvent } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 5 login requests per `window` per minute
    message:
        { message: 'Too many attempts from this IP, please try again after a 60 second pause' },
    handler: (req, res, next, options) => {
        logEvent(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}\t`, 'rateLimiter.log')
        res.status(options.statusCode).send(options.message)
        // next()
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = loginLimiter