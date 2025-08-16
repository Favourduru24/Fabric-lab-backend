const express = require('express')
const subscriptionController = require('../controllers/subscription-controller')
const paymentController = require('../controllers/payment-controller')
const router = express.Router()
const authMiddleware = require('../middleware/auth-middleware')

router.use(authMiddleware)

router.get('/get-user-subcription', authMiddleware, subscriptionController.getSubscription)
router.post('/create-order', paymentController.createOrder)
router.post('/capture-order', paymentController.capturePayment)

module.exports = router