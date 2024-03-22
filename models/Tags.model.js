const mongoose = require("mongoose")

const TagsSchema = mongoose.Schema({
    title: {
        type: String
    },
    TagColour: {
        type: String
    },
  
}, { timeStamps: true })

const Tags = mongoose.model("Tag", TagsSchema)

module.exports = Tags
