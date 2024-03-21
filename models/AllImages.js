const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    img: [{
        Name: String,
        ImgUrl: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);
