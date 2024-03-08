const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Types.ObjectId, required: true, ref: 'Order' },
    tranxTionId: {
        type: String,
        required: true
    }

}, { timestamps: true })

const Payment = mongoose.model('Payment', PaymentSchema)
module.exports = Payment;