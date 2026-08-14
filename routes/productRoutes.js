const express = require("express");
const router = express.Router();
const product = require("../models/product.js");
const Review = require("../models/review.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const { productSchema } = require("../schema.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../ExpressError");

const upload = multer({ storage });

const validateProduct = (req, res, next) => {
    const result = productSchema.validate(req.body, { allowUnknown: true });
    console.log("VALIDATION RESULT:", result.error);
    if (result.error) {
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

const validReview = (req, res, next) => {
    console.log("this is your req.body....");
    console.log(req.body);

    const result = reviewSchema.validate(req.body.review);
    console.log("this is your result ............");
    console.log(result);
    console.log("this is result.error ...........");
    console.log(result.error);

    if (result.error) {
        throw new ExpressError(400, result.error);
    }
    next();
};

router.post(
    "/product/add",
    isLoggedIn,
    isOwner,
    upload.single("image"),
    (req, res, next) => {
        console.log("REQ.FILE:", req.file);
        console.log("REQ.BODY:", req.body);

        if (!req.file) {
            return next(new ExpressError(400, "Image is required"));
        }

        if (req.file) {
            req.body.image = req.file.path;
        }

        if (req.body.status) {
            req.body.Availability = req.body.status === "instock";
        }

        next();
    },
    validateProduct,
    async (req, res, next) => {
        try {
            const data = { ...req.body };

            delete data.reviews;
            delete data.status;

            // Convert review_count to number
            if (data.review_count) {
                data.review_count = parseInt(data.review_count) || 0;
            } else {
                data.review_count = 0;
            }

            // Convert rating to number if present
            if (data.rating) {
                data.rating = parseFloat(data.rating);
            }

            // Convert prices to numbers
            if (data.Selling_price) {
                data.Selling_price = parseFloat(data.Selling_price);
            }
            if (data.orginal_price) {
                data.orginal_price = parseFloat(data.orginal_price);
            }

            const newProduct = await product.create(data);
            console.log(newProduct);

            req.flash("addProduct", "You added product successfully!");
            res.redirect("/apb/add_product");
        } catch (err) {
            console.error("PRODUCT CREATE ERROR:", err);
            next(err);
        }
    }
);

router.delete("/apb/product/:id/reviews/:reviewId", async (req, res) => {
    try {
        const { id, reviewId } = req.params;

        await Review.findByIdAndDelete(reviewId);

        const product1 = await product.findById(id);
        product1.reviews.pull(reviewId);
        await product1.populate("reviews");

        if (product1.reviews.length > 0) {
            const totalRating = product1.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / product1.reviews.length;
            product1.rating = Number(averageRating.toFixed(1));
            product1.review_count = product1.reviews.length;
        } else {
            product1.rating = 0;
            product1.review_count = 0;
        }

        await product1.save();
        req.flash("deleteReview", "Review deleted successfully");
        res.redirect(`/apb/fullproduct/${id}`);
    } catch (err) {
        console.log("DELETE REVIEW ERROR:", err);
        res.status(500).send("Something went wrong");
    }
});

router.post("/apb/:id/reviews/:ownerID", isLoggedIn, validReview, async (req, res) => {
    try {
        const product1 = await product.findById(req.params.id);

        const newReview = new Review(req.body.review);
        newReview.owner = req.params.ownerID;
        await newReview.save();

        product1.reviews.push(newReview._id);
        await product1.populate("reviews");

        const totalRating = product1.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / product1.reviews.length;

        product1.rating = Number(averageRating.toFixed(1));
        product1.review_count = product1.reviews.length;

        await product1.save();

        req.flash("review", "Thanks for your valuable review");
        res.redirect(`/apb/fullproduct/${product1._id}`);
    } catch (err) {
        console.log("REVIEW ERROR:", err);
        res.status(500).send("Something went wrong");
    }
});

router.get("/apb/cart", isLoggedIn, async (req, res) => {
    try {
        const cartArray = req.session.cartArray || [];
        const productIds = cartArray.map(item => item.productId);
        const products = await product.find({ _id: { $in: productIds } });

        const cartItems = products.map(prod => {
            const cartItem = cartArray.find(item => item.productId === prod._id.toString());
            return {
                product: prod,
                quantity: cartItem.quantity
            };
        });

        console.log(cartItems);
        res.render("listing/cart.ejs", { cartItems });
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/apb/home");
    }
});

router.get("/apb/order-summary", isLoggedIn, async (req, res, next) => {
    try {
        const cartArray = req.session.cartArray || [];

        if (cartArray.length === 0) {
            req.flash("error", "Your cart is empty");
            return res.redirect("/apb/cart");
        }

        const productIds = cartArray.map(item => item.productId);
        const products = await product.find({ _id: { $in: productIds } });

        const cartItems = products.map(prod => {
            const cartItem = cartArray.find(item => item.productId === prod._id.toString());
            const quantity = Number(cartItem.quantity) || 1;
            const sellingPrice = Number(prod.Selling_price) || 0;
            const originalPrice = Number(prod.orginal_price) || sellingPrice;
            const amount = sellingPrice * quantity;
            const discount = Math.max(originalPrice - sellingPrice, 0) * quantity;

            return {
                product: prod,
                quantity,
                sellingPrice,
                originalPrice,
                amount,
                discount
            };
        });

        const subtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
        const productDiscount = cartItems.reduce((sum, item) => sum + item.discount, 0);
        const taxableAmount = subtotal - productDiscount;
        const gst = Math.round(taxableAmount * 0.05);
        const deliveryCharges = 0;
        const totalPayable = taxableAmount + gst + deliveryCharges;
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const invoiceNumber = "INV-" + Date.now();

        res.render("listing/invoice.ejs", {
            currUser: req.user,
            cartItems,
            invoiceNumber,
            orderDate: new Date(),
            totalItems,
            subtotal,
            productDiscount,
            deliveryCharges,
            gst,
            totalPayable,
            savings: productDiscount
        });
    } catch (err) {
        console.error("INVOICE ERROR:", err);
        next(err);
    }
});

router.post("/addCart/:id", isLoggedIn, (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    console.log(id, quantity);

    if (!req.session.cartArray) {
        req.session.cartArray = [];
    }

    req.session.cartArray.push({ productId: id, quantity });
    console.log(req.session.cartArray);

    req.flash("success", "Your product added to Cart");
    res.redirect("/apb/home");
});

router.get("/search", async (req, res) => {
    try {
        const q = req.query.q;

        if (!q) return res.redirect("/apb/home");

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            const results = await product.find({
                name: { $regex: '^' + q, $options: 'i' }
            }).limit(8).select("name Category _id");
            return res.json(results);
        }

        const results = await product.find({
            name: { $regex: q, $options: 'i' }
        });

        res.render("listing/search_results.ejs", { results, q });
    } catch (err) {
        console.log("SEARCH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/apb/logout", (req, res, next) => {
    console.log("log out route hit");
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out");
        res.redirect("/apb/home");
    });
});

module.exports = router;
