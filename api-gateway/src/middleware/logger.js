const fs = require('fs')
const fsPromises = require('fs').promises
const path = require("path")

 const logEvent = async (message, logName) => {
   
     const no = 500000000000000000000

     const uuid = Math.floor(Math.random(no) * no)
     const dateTime = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
      timeStyle: 'long',
         });

      const logs = `${uuid}\t${formatter.format(dateTime)}\t${message}\n`

      try {

         if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
          } else {
           await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logs)
          }

      } catch (error) {
         console.log(error)
      }
     
}

 const logger = (req, res, next) => {
     logEvent(`${req.method}\t${req.url}\t${req.headers.origin}\n`, 'errLog.log')

    next()
 }

    module.exports = {logEvent, logger}