const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    productName: String,
    images: [{
        img: String,
    }],
    property: String,
    sizes: [{
        id: Number,
        size: String,
        originalPrice: Number,
        discoPrice: Number,
    }],
    originalPrice: Number,
    discoPrice: Number,
    vendor: String,
    sku: String,
    avilable: {
        type:Boolean,
        default:true
    },
    productType: String,
    Desc: String,
    Category:{
        type:String
    },
    addInfo: {
        base: String,
        material: String,
        dishwasherSafe: String,
        packageContent: String,
        warranty: Number,
        certification: String
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
