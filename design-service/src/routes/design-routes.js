const express = require('express')
const router = express.Router()
const designController = require('../controllers/design-controller')
const authMidddleware = require('../middleware/auth-middleware')
const rateLimiter = require('../middleware/rateLimiter')



router.get('/get-user-design', rateLimiter, authMidddleware, designController.getUserDesign)
router.get('/get-user-design/:id', rateLimiter, authMidddleware, designController.getUserDesignByID)
router.post('/save-design', authMidddleware, designController.saveDesign)
router.delete('delete-design/:id', rateLimiter, designController.deleteDesign)
router.get('/get-all-design', rateLimiter, authMidddleware, designController.getAllDesign)

module.exports = router