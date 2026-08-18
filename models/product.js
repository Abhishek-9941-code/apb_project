const mongoose = require("mongoose");
const { productSchema } = require("../schema");
const Schema = mongoose.Schema;
const review = require("./review.js");
const productSchema1 = new Schema({
    name: {
        type: String
    },

    Category: String,

    company: {
        type: String,
        default: "General"
    },

    brand: {
        type: String,
        default: "General"
    },

    description: String,

    orginal_price: Number,

    costPrice: {
        type: Number,
        default: 0,
        min: 0
    },

    Selling_price: Number,

    stock: {
        type: Number,
        default: 0,
        min: 0
    },

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