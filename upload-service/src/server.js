require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const corsOption = require('./config/corOption')
const dbConnc = require('./config/dbConnc')
const helmet = require('helmet')
const {logger} = require('./middleware/logger')
const errorMiddleware = require('./middleware/errorHandler')
const PORT = process.env.PORT || 4002

app.use(cors(corsOption))
app.use(express.json())
app.use(express.static('public'))
app.use(logger)


app.use('/api/media', require('./routes/upload-route'))

app.use(helmet())
app.use(errorMiddleware)

dbConnc()
app.listen(PORT, () => {
console.log(`Upload service server running on port ${PORT}`) 
})