const mongoose = require("mongoose")

const VouchersSchema = mongoose.Schema({
    title: {
        type: String
    },
    OffPercentage: {
        type: String
    },
    howMuchTimeApply: {
        type: String
    }
}, { timeStamps: true })

const Vouchers = mongoose.model("Voucher", VouchersSchema)

module.exports = Vouchers
