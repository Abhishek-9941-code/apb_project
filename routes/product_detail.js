const express = require("express");
const router = express.Router({ mergeParams: true });
const product = require("../models/product");
const { isLoggedIn, isOwner } = require("../middleware.js");

router.get("/",async (req,res)=>{
    let {id} = req.params
    console.log(req.params)
    let prod = await product.findById(id).populate({path: "reviews",populate: {path: "owner"},});
    categor = prod.Category;
    relatedProducts = await product.find({Category : categor}).limit(4)
    res.render("listing/product_detail.ejs",{relatedProducts,prod,currUser:req.user})
}
)
router.get("/edit", isLoggedIn, isOwner, async (req, res, next) => {

    try {

        const { id } = req.params;

        const prod = await product.findById(id);

        if (!prod) {
            req.flash("error", "Product not found");
            return res.redirect("/apb/top_product");
        }

        res.render("listing/edit_product.ejs", {
            prod,
            currUser: req.user
        });

    } catch (err) {

        console.log("EDIT PRODUCT ERROR:", err);
        next(err);

    }

});

router.post("/edit", isLoggedIn, isOwner, async (req, res, next) => {
    try {
        const { id } = req.params;

        const prod = await product.findById(id);

        if (!prod) {
            req.flash("error", "Product not found");
            return res.redirect("/apb/top_product");
        }

        // Basic product details
        prod.name = req.body.name;
        prod.Category = req.body.Category;
        prod.description = req.body.description;

        // Pricing
        prod.Selling_price = req.body.Selling_price;
        prod.orginal_price = req.body.orginal_price;

        const stockValue = Number(req.body.stock || 0);
        prod.stock = stockValue;

        // Availability
        if (req.body.status) {
            prod.Availability = req.body.status === "instock" && stockValue > 0;
        } else {
            prod.Availability = stockValue > 0;
        }

        // Image abhi same rahegi
        // Image update next step me karenge.

        await prod.save();

        req.flash("success", "Product updated successfully!");

        res.redirect(`/apb/fullproduct/${id}`);

    } catch (err) {
        console.error("UPDATE PRODUCT ERROR:", err);
        next(err);
    }
});

const deleteProduct = async (req, res, next) => {
    try {

        console.log("DELETE PRODUCT REQUEST");
        console.log("PARAMS:", req.params);
        console.log("METHOD:", req.method);
        console.log("URL:", req.originalUrl);

        const { id } = req.params;

        const prod = await product.findById(id);

        if (!prod) {
            req.flash("error", "Product not found");
            return res.redirect("/apb/top_product");
        }

        await product.findByIdAndDelete(id);

        req.flash("success", "Product deleted successfully!");

        res.redirect("/apb/top_product");

    } catch (err) {

        console.error("DELETE PRODUCT ERROR:", err);
        next(err);

    }
};

router.post("/delete", isLoggedIn, isOwner, deleteProduct);
router.delete("/delete", isLoggedIn, isOwner, deleteProduct);

module.exports = router;