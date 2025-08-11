require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOption = require('./config/corsOption')
const dbConnc = require('./config/dbConnc')
const helmet = require('helmet')
const {logger} = require('./middleware/logger')
const errorMiddleware = require('./middleware/errorHandler')
const PORT = process.env.PORT || 4001

app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use(cors(corsOption))
app.use(logger)
app.use(helmet())


app.use('/api/design', require('./routes/design-routes')) 

app.use(errorMiddleware)

dbConnc()
app.listen(PORT, () => {
console.log(`Design service server running on port ${PORT}`) 
})