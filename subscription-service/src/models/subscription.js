const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    userId: String,
    isPremium: {
        type: Boolean,
        default: false
    },
    paymentId: String,
    premiumSince: Date,
}, {
    timestamps: true
})

subscriptionSchema.pre('save', function(next){
 this.updatedAt = Date.now()
 next()
})

const Subscription = mongoose.model('Subscription', subscriptionSchema)

module.exports = Subscription