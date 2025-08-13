const cloudinary =  require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
 api_key: process.env.CLOUDINARY_KEY,
 api_secret: process.env.CLOUDINARY_SECRET
})

const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: 'auto'
    }, (error, result) => {
       if(error) {
         reject(error)
       } else {
         resolve(result)
       }
    })
     uploadStream.end(file.buffer)
    })
}

module.exports = {uploadMediaToCloudinary}