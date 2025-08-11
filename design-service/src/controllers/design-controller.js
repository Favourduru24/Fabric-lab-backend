const Design = require('../models/design')
const mongoose = require('mongoose')

 const getUserDesign = async (req, res) => {
   try {
      //  const userId = req.user.userId

      //  if(!mongoose.Type.ObjectId.isValid(userId)) {
      //  return res.status(400).json({
      //    success: false,
      //    message: 'Invalid ID format.'
      //  })
      // }

       const design = await Design.find({userId})
                                   .sort({upDatedAt: -1 })

       if(!design) {
         return res.status(404).json({
             success: false,
             message: 'Error fetching user design'
         })
       }

       res.status(200).json({
         message: 'design fetched successfully!',
         data: design
       })

   } catch (error) {
      //  res.status(500).json({
      //    success: false,
      //    message: 'Something went wrong fetching user design.'
      // }) 
      console.log('Something went wrong fetching design', error)
   }
 }

 const getUserDesignByID = async (req, res) => {

   try {

    const userId = req.user.userId
    const id = req.params.id

     if(!mongoose.Type.ObjectId.isValid(userId) || !mongoose.Type.ObjectId.isValid(id)) {
       return res.status(400).json({
         success: false,
         message: 'Invalid ID format.'
       })
     }

     const designId = await Design.findOne({userId, _id:id})  

     if(!designId) {
         return res.status(404).json({
             success: false,
             message: 'Error fetching user design'
         })
       }

       res.status(200).json({
         message: 'design fetched successfully!',
         data: designId
       })

   } catch (error) {
        console.log('Error fetching design by id', error)
       res.status(500).json({
         success: false,
         message: 'Something went wrong fetching user design.'
      }) 
   }
 }

 const saveDesign = async (req, res, next) => {
      // const session = mongoose.startSession()
      // await session.startTransaction()
       console.log("User:", req.user);

   try {

    const userId = req.user.userId
    const {id, name, canvasData, width, height, category} = req.body

   if(id){
      const designId = await Design.findOne({_id:id, userId}) 

       if(!designId) {
         return res.status(404).json({
             success: false,
             message: 'No design found.'
         })
       }

      designId.name = name
      designId.canvasData = canvasData
      designId.width = width
      designId.height = height
      designId.category = category
      designId.upDatedAt = Date.now()

      const upDatedDesign = await designId.save()

     return res.status(200).json({
         success: true,
         message: 'design updated successfully.',
         data: upDatedDesign
      })

   } else {
      const newDesign = new Design({
         userId,
         name: name || 'Untitled Design',
          width,
          height,
          canvasData,
          category
      })

      const saveNewDesign = await newDesign.save()
      
      return res.status(200).json({
         success: true,
         message: 'design saved successfully.',
         data: saveNewDesign
      })
  
   }

   } catch (error) {
        next(error)
         console.log('Something went wrong saving design.')
        // await session.abortTransaction()
        // session.endSession()
        res.status(500).json({
         success: false,
         message: 'Something went wrong saving design.'
      }) 
   }
 }

 const deleteDesign = async (req, res) => {
   try {

    const userId = req.user.userId
    const id = req.params.id

    if(!mongoose.Type.ObjectId.isValid(userId) || !mongoose.Type.ObjectId.isValid(id)) {
       return res.status(400).json({
         success: false,
         message: 'Invalid ID format.'
       })
     }

     const designId = await Design.findOne({userId, _id:id})  

     if(!designId) {
         return res.status(404).json({
             success: false,
             message: 'Error fetching user design'
         })
       }

       await Design.deleteOne({id: designId})

       res.status(200).json({
         success: true,
         message: 'design deleted successfully.'
       })
     
   } catch (error) {
        console.error('Error deleting design', error)
       res.status(500).json({
         success: false,
         message: 'Something went wrong deleting design.'
      }) 
   }
 }

  module.exports = {
     getUserDesign,
     getUserDesignByID,
     saveDesign,
     deleteDesign
  }