const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises


 const logEvent = async (message, logName) => {

    const uuid = 500000000000000000
    const num = Math.floor(Math.random(uuid) * uuid)
    const dateTime = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
      timeStyle: 'long',
         });

    const log = `${num}\t${formatter.format(dateTime)}\t${message}\n`

      try {

          if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
             await fsPromises.mkdir(path.join(__dirname, '..', 'log'))
          } else {
            await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), log)
          }

      } catch (error) {
         console.log('Error logging to file.', error)
      }
 }

  const logger = (req, res, next) => {
    logEvent(`${req.method}\t${req.url}\t${req.headers.origin}\n`, 'errLog.log')
  }

  module.exports = {logEvent, logger}