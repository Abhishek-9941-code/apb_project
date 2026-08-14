const mongoose = require("mongoose");
const { productSchema } = require("../schema");
const Schema = mongoose.Schema;
const review = require("./review.js");
const productSchema1 = new Schema({
    name: {
        type: String
    },

    Category: String,

    description: String,

    orginal_price: Number,

    Selling_price: Number,

    rating: {
        type: Number,
        default: 0
    },

    review_count: {
        type: Number,
        default: 0
    },

    salesCount: {
        type: Number,
        default: 0
    },

    Availability: {
        type: Boolean,
        default: true
    },

    image: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]

}, {
    timestamps: true
});


productSchema1.post("findOneAndDelete",async (product)=>{
    if(product) {
        await review.deleteMany({_id: {$in: product.reviews}})
    }
});


module.exports= mongoose.model("Product",productSchema1)