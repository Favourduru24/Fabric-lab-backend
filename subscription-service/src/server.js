require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const corsOption = require('./config/corsOption')
const dbConnc = require('./config/dbConnc')
const helmet = require('helmet')
const {logger} = require('./middleware/logger')
const errorMiddleware = require('./middleware/errorHandler')
const PORT = process.env.PORT || 4003

app.use(cors(corsOption))
app.use(express.json())
app.use(express.static('public'))
app.use(logger)


app.use('/api/subscription', require('./routes/subscription-routes') )

app.use(helmet())
app.use(errorMiddleware)

dbConnc()
app.listen(PORT, () => {
console.log(`Subscription service server running on port ${PORT}`) 
})