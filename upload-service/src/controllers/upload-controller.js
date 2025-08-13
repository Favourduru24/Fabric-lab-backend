const {uploadMediaToCloudinary} = require('../config/cloudinary')
const Media = require('../models/media')

const uploadMedia = async (req, res) => {

     try {

       if(!req.file) {
         return res.status(400).json({
             success: false,
             message: 'No file found!'
         })
       }  

       const {originalName, mimeType, size, width, height} = req.file
     
       const {userId} = req.user

       const cloudinaryResult = await uploadMediaToCloudinary(req.file)

       const newlyCreatedMedia = new Media({
         userId,
         name: originalName,
         cloudinaryId: cloudinaryResult.public_id, 
         url: cloudinaryResult.secure_url,
         mimeType: mimeType,
         size,
         width,
         height
       })

       await newlyCreatedMedia.save()

       res.status(200).json({
         success: true,
         data: newlyCreatedMedia
       })


     } catch (error) {
        console.log('Something went wrong uploading asset', error)
        return res.status(500).json({
            success: false,
            message: 'Something went wrong creating asset',
        }) 
     }
}

const getAllMediaByUser = async (req, res) => {
    try {

        const media = await Media.find({userId: req.user.userId}).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            data: media
        })
        
    } catch (error) {
       console.log('Something went wrong fetching asset', error)
       return res.status(500).json({
            success: false,
            message: 'Something went wrong fetching asset',
        })   
    }
}


module.exports = {
  uploadMedia, getAllMediaByUser   
}