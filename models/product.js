const mongoose = require("mongoose")
const product = new mongoose.Schema(
    {
        name : {
            type : String,
            // required : true
        },
        Category : String,
        description : String,
        orginal_price : Number,
        rating : Number,
        Selling_price : Number,
        Availability : Boolean,
        image : String
    }
)

module.exports= mongoose.model("Product",product)