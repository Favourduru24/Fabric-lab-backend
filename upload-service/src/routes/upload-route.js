const express = require('express')
const router = express.Router()
const multer = require('multer')
const { uploadMedia, getAllMediaByUser} = require('../controllers/upload-controller')
const { generateImageFromAiAndUploadToDB} = require('../controllers/ai-image-controller')


const upload = multer({
    storage: multer.memoryStorage(),
    limits: 10 * 1024 * 1024
}).single('file')

router.post('/upload', (req, res, next) => {
    upload(req, res, function(err){
      if(err instanceof multer.MulterError)  {
        return res.status(400).json({
            success: false,
            message: err.message
        }) 
      } else if(err) {
         return res.status(500).json({
            success: false,
            message: err.message
        }) 
      }

      if(!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file found'
        }) 
      }

      next()
    })
},

uploadMedia
)

router.get('/get-asset', getAllMediaByUser)
router.post('/ai-image-generator', generateImageFromAiAndUploadToDB)

 

module.exports = router