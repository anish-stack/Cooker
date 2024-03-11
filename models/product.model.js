const mongoose = require("mongoose");

const SizeAndStock = new mongoose.Schema({
    SizeNumber: {
        type: String,
        required: [true, "Please provide a size number"] 
    },
    StockNumber: {
        type: String,

    },
    StockPrice: {
        type: String,
    },
    adjustedPrice:{
        type: String,
    }

});

const ProductSchema = new mongoose.Schema({
    ProductName: {
        type: String,
        required: true
    },
    ProductDescription: {
        type: String,
        required: true
    },
    discountPrice: { 
        type: Number
    },
    prices: {
        type: Number,
     
    },
    tag: {
        type: String
    },
    sizes: {
        type: [SizeAndStock],
        required: true
    },
    color: {
        type: [String]
    },
    image: {
        type: [String],
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    category: {
        type: String
    },
    keyword: {
        type: [String]
    }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
