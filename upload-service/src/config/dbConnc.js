const mongoose = require('mongoose')

const connToDB = async () => {

  try {
    if(!process.env.MONGODB_URI) {
        throw new Error('Mongodb url is missing!')
    }

     await mongoose.connect(process.env.MONGODB_URI)
     console.log('Conected to mongodb!')
     
  } catch(error) {
    console.log('Something went wrong connecting to MONGODB', error)
     throw new Error('Something went wrong connecting to Mongodb!') 
  }
}

 module.exports = connToDB