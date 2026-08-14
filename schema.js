const joi = require('joi');
const productSchema = joi.object(
    {
        name : joi.string().required(),
        Category : joi.string().required(),
        description : joi.string().optional().allow(''),
        orginal_price : joi.number().optional(),
        rating : joi.number().optional(),
        Selling_price : joi.number().required().min(5),
        Availability : joi.boolean().required().truthy('true').falsy('false'),
        image : joi.string().required(),
        review_count : joi.string().optional().allow('').default('0'),
        badge: joi.string().optional().allow(''),
        status: joi.string().valid('instock','outofstock').optional(),
    }
).unknown(true)

const reviewSchema = joi.object(
    {
        comment : joi.string().required(),
        rating : joi.number().required().min(0).max(5)
    }
)

module.exports = {
    productSchema,
    reviewSchema
}


