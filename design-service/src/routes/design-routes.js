const express = require('express')
const router = express.Router()
const designController = require('../controllers/design-controller')



router.get('/get-user-design', designController.getUserDesign)
router.get('/get-user-design/:id', designController.getUserDesignByID)
router.post('/save-design', designController.saveDesign)
router.delete('delete-design/:id', designController.deleteDesign)

module.exports = router