const mongoose = require('mongoose')

const designSchema = new mongoose.Schema({
     userId: String,
     name: String,
     canvasData: String,
     width: Number,
     height: Number,
     category: String,
}, {
    timestamp: true
})

 const Design = mongoose.model('Design', designSchema)

 module.exports = Design