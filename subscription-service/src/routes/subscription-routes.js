const express = require('express')
const subscriptionController = require('../controllers/subscription-controller')
const router = express.Router()
const authMiddleware = require('../middleware/auth-middleware')

router.use(authMiddleware)

router.get('', subscriptionController.getSubscription)

module.exports = router