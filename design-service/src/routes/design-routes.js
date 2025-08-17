const express = require('express')
const router = express.Router()
const designController = require('../controllers/design-controller')
const authMidddleware = require('../middleware/auth-middleware')



router.get('/get-user-design', authMidddleware, designController.getUserDesign)
router.get('/get-user-design/:id', authMidddleware, designController.getUserDesignByID)
router.post('/save-design', authMidddleware, designController.saveDesign)
router.delete('delete-design/:id', designController.deleteDesign)
router.get('/get-all-design', authMidddleware, designController.getAllDesign)

module.exports = router