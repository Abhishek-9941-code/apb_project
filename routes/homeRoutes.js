const express = require("express");
const router = express.Router();
const product = require("../models/product.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

router.get("/apb/home", async (req, res) => {
    try {
        const cookie = req.cookies;

        const allProducts = await product.find().limit(4);
        const newArrivals = await product.find().sort({ createdAt: -1 }).limit(4);
        const mostRated = await product.find().sort({ rating: -1 }).limit(4);

        res.render("listing/home.ejs", {
            cookie,
            allProducts,
            newArrivals,
            mostRated
        });
    } catch (err) {
        console.log("HOME ERROR:", err);
        res.status(500).send("Something went wrong");
    }
});

router.get("/apb/top_product", async (req, res) => {
    const data = await product.find();
    res.render("listing/top_products.ejs", { data });
});

router.get("/apb/add_product", isLoggedIn, isOwner, (req, res) => {
    res.render("listing/addproduct.ejs");
});

router.get("/apb/new-arrivals", async (req, res, next) => {
    try {
        const data = await product.find().sort({ createdAt: -1 });
        res.render("listing/new_arrivals.ejs", {
            data,
            cookie: req.cookies
        });
    } catch (err) {
        next(err);
    }
});

router.get("/apb/most-rated", async (req, res, next) => {
    try {
        const data = await product.find().sort({ rating: -1 });
        res.render("listing/most_rated.ejs", {
            data,
            cookie: req.cookies
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
