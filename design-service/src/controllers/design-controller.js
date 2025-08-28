const Design = require('../models/design')
const mongoose = require('mongoose')

 async function InvalidateDesignCache (req, input) {
     const cachedKey = `post${input}`
     await req.redisClient.del(cachedKey

     )
    const keys = req.redisClient.keys('designs:*')
    if(keys.length > 0) {
      await req.redisClient.del(keys)
    }
 }

 const getUserDesign = async (req, res) => {

   try {
        const userId = req.user.userId

       const design = await Design.find({userId})
                                   .sort({upDatedAt: -1 })

       if(!design) {
         return res.status(404).json({
             success: false,
             message: 'No design found.'
         })
       }

       res.status(200).json({
         success: true,
         message: 'design fetched successfully!',
         //data: design
       })

   } catch (error) {
       res.status(500).json({
         success: false,
         message: 'Something went wrong fetching user design.'
      }) 
      console.log('Something went wrong fetching design', error)
   }
 }

 const getAllDesign = async (req, res) => {
    
   try {

    const {search, category = '', date, page = 1, limit = 10} = req.query

        const numPage = Number(page)
        const numLimit = Number(limit)

        const cacheKey = `designs:${numPage}:${numLimit}`
        const cashedDesign = await req.redisClient.get(cacheKey)

        if(cashedDesign) {
           return res.json(JSON.parse(cashedDesign))
        }
       // Date conditions
        let timeCondition = {}
        
        if(date) {
           const now = Date.now()

          if(date === 'recently_modified') {
            timeCondition.updatedAt = {$gte: new Date(now - 60 * 60 * 1000)}
           } else if(date === 'created_recently') {
              timeCondition.createdAt = {$gte: new Date(now - 60 * 60 * 1000)}
           }else if(date === 'yesterday'){
             const yesterday = new Date(now)
             yesterday.setDate(yesterday.getDate() - 1)
             timeCondition.createdAt = {$gte: yesterday}
           } else if(date === '1week') {
             const lastWeek = new Date(now)
             lastWeek.setDate(lastWeek.getDate() - 7)
             timeCondition.createdAt = {$gte: lastWeek}
           } else if(date === 'last_month'){
             const lastMonth = new Date(now)
             lastMonth.setDate(lastMonth.getMonth() - 1)
             timeCondition.createdAt = {$gte: lastMonth}
           }
        }
        //Search condition
        const searchCondition = search ?
         { $or: [
          {name: {$regex: search, $options: 'i'}},
          {category: {$regex: search, options: 'i'}}
         ]} : {}

         const condition = {$and: [
           searchCondition,
           timeCondition,
           category,
         ].filter(cond => Object.keys(cond).length > 0)}

          //pagination
         const skipAmout = numPage - numLimit

       const design = await Design.find(condition)
                                   .skip(skipAmout)
                                   .sort({upDatedAt: -1 })
                                   .limit(numLimit)

       if(!design) {
         return res.status(404).json({
             success: false,
             message: 'Error fetching user design'
         })
       }

       const designCount = await Design.countDocuments(condition)

       const result = {
         data: design,
         totalPage: Math.ceil(designCount / numLimit) 
       }


       await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))

       res.status(201).json({
         message: 'design fetched successfully!',
         success: true,
         result
       })

   } catch (error) {
       res.status(500).json({
         success: false,
         message: 'Something went wrong fetching design.'
      }) 
      console.log('Something went wrong fetching design', error)
   }
 }

 const getUserDesignByID = async (req, res) => {

   try {

    const userId = req.user.userId
    const id = req.params.id
     
      const cacheKey = `designs:${id}`
        const cashedDesign = await req.redisClient.get(cacheKey)

        if(cashedDesign) {
           return res.json(JSON.parse(cashedDesign))
        }
     
     if(!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).json({
         success: false,
         message: 'Invalid ID format.'
       })
     }

     const designId = await Design.findOne({userId, _id:id})  

     if(!designId) {
         return res.status(404).json({
             success: false,
             message: 'Design not found'
         })
       }

       await req.redisClient.setex(cashedDesign, 3600, JSON.stringify(designId))

       res.status(200).json({
         message: 'design fetched successfully!',
          success: true,
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
      await InvalidateDesignCache(req, saveNewDesign._id.toString())
      
      return res.status(200).json({
         success: true,
         message: 'design saved successfully.',
         data: saveNewDesign
      })
  
   }

   } catch (error) {
        next(error)
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
             message: 'No design found.'
         })
       }

       await Design.deleteOne({id: designId})
       
       await InvalidateDesignCache(req, req.params.id)

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
     getAllDesign,
     getUserDesign,
     getUserDesignByID,
     saveDesign,
     deleteDesign,
  }