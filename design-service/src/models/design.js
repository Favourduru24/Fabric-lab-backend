const mongoose = require('mongoose')

const designSchema = new mongoose.Schema({
     userId: {
        type: String
    },
     name: {
        type: String
     },
     canvasData: {
        type: String
     },
     width: {
        type: Number
     },
     height:{
        type: Number
     },
     category: {
        type: String
     },
     
},{
    timestamps: true
})

 const Design = mongoose.model('Design', designSchema)

 module.exports = Design