const mongoose = require("mongoose")

const CategoreySchema = mongoose.Schema({
    title:{
        type:String
    },
    CatImg:{
        type:String
    }
},{timeStamps:true})

const Category = mongoose.model("Category",CategoreySchema)

module.exports = Category
