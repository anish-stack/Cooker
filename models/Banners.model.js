const mongoose = require('mongoose');

const BannerSchema = mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
