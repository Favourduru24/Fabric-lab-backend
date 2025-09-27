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
      const { query = '', category = '', date, page = 1, limit = 10 } = req.query;
      const numPage = Math.max(1, Number(page));
      const numLimit = Math.max(1, Number(limit));
      const userId = req.user.userId;

      // Create cache key with encoded parameters
      const cacheKey = `userDesigns:${userId}:${numPage}:${numLimit}`;
      const cashedDesign = await req.redisClient.get(cacheKey);
// ${encodeURIComponent(query)}
      if(cashedDesign) {
         return res.json(JSON.parse(cashedDesign));
      }
      // Base condition - user filter
      const baseCondition = { user: userId };

      // Date conditions
      // let timeCondition = {};
      
      // if(date) {
      //    const now = new Date();

      //    if(date === 'today') {
      //       const startOfDay = new Date(now);
      //       startOfDay.setHours(0, 0, 0, 0);
      //       timeCondition.createdAt = { $gte: startOfDay };
      //    } else if(date === 'created_recently') {
      //       timeCondition.createdAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
      //    } else if(date === 'yesterday') {
      //       const yesterday = new Date(now);
      //       yesterday.setDate(yesterday.getDate() - 1);
      //       yesterday.setHours(0, 0, 0, 0);
      //       const endOfYesterday = new Date(yesterday);
      //       endOfYesterday.setHours(23, 59, 59, 999);
      //       timeCondition.createdAt = { $gte: yesterday, $lte: endOfYesterday };
      //    } else if(date === 'last week') {
      //       const lastWeek = new Date(now);
      //       lastWeek.setDate(lastWeek.getDate() - 7);
      //       timeCondition.createdAt = { $gte: lastWeek };
      //    } else if(date === 'last month') {
      //       const lastMonth = new Date(now);
      //       lastMonth.setMonth(lastMonth.getMonth() - 1);
      //       timeCondition.createdAt = { $gte: lastMonth };
      //    }
      // }

      // Search condition
      const searchCondition = query ? {
         $or: [
            { name: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } }
         ]
      } : {};

      // Category condition (exact match or regex-based)
      const categoryCondition = category ? { 
        category: { $regex: category, $options: 'i' } 
      } : {};

      // Build final conditions efficiently
     const conditions = {
            $and: [
                baseCondition,
                searchCondition, 
                categoryCondition
            ].filter(cond => Object.keys(cond).length > 0)
        };
      
       
      const skipAmount = (numPage - 1) * numLimit;

      const designs = await Design.find(conditions)
         .sort({ updatedAt: -1 })
         .skip(skipAmount)
         .limit(numLimit);

      const designCount = await Design.countDocuments(conditions);

      const result = {
         data: designs,
         totalPages: Math.ceil(designCount / numLimit),
         currentPage: numPage,
         totalItems: designCount,
         itemsPerPage: numLimit
      };

      await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

      res.status(200).json({
         success: true,
         message: designs.length > 0 ? 'Designs fetched successfully!' : 'No designs found',
         data: result
      });

   } catch (error) {
      console.log('Something went wrong fetching design', error);
      res.status(500).json({
         success: false,
         message: 'Something went wrong fetching user designs.'
      }); 
   }
}

const getAllDesign = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    const numPage = Math.max(1, Number(page));
    const numLimit = Math.max(1, Number(limit));

    // ✅ FIX: Include query in cache key
    const cacheKey = `designs:${query || 'all'}:${numPage}:${numLimit}`;
    const cashedDesign = await req.redisClient.get(cacheKey);

    if (cashedDesign) {
      return res.json(JSON.parse(cashedDesign));
    }

    // Search condition
    const searchCondition = query ? {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    } : {};

    const skipAmount = (numPage - 1) * numLimit;

    const designs = await Design.find(searchCondition)
      .skip(skipAmount)
      .sort({ updatedAt: -1 })
      .limit(numLimit);

    const designCount = await Design.countDocuments(searchCondition);

    const result = {
      data: designs,
      totalPages: Math.ceil(designCount / numLimit),
      currentPage: numPage,
      totalItems: designCount,
      itemsPerPage: numLimit
    };

    // ✅ Cache for 5 minutes (300 seconds)
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({
      success: true,
      message: 'Designs fetched successfully!',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong fetching design.'
    });
    console.log('Something went wrong fetching design', error);
  }
};

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