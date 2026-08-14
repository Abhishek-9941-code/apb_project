const express = require("express");
const router = express.Router();
const User = require("../models/user.js");

router.get("/root", (req, res) => {
    res.render("sign_up/login.ejs");
});

router.get("/demouser", async (req, res) => {
    const fakeUser = new User({
        username: "abhishek123",
        email: "abhishek@gmail.com",
        first_name: "abhishek",
        last_name: "saini"
    });

    const registeredUser = await User.register(fakeUser, "abhishek123");
    res.send(registeredUser);
});

router.get("/apb/cookie", (req, res) => {
    res.cookie("session_id", "12345");
    res.send("session id is set");
});

router.get("/apb/getcookie", (req, res) => {
    console.log(req.cookies);
    res.send("send you cookies");
});

router.get("/apb/president", (req, res) => {
    const { president = "murmure" } = req.cookies;
    res.send(`hii my president name is ${president}`);
});

router.get("/apb/get_signed_cookie", (req, res) => {
    res.cookie("school", "ajmer", { signed: true });
    res.send("theek hai");
});

router.get("/verify", (req, res) => {
    console.log(req.signedCookies);
    res.send("verified");
});

router.get("/test", (req, res) => {
    if (req.session.count) {
        req.session.count += 1;
    } else {
        req.session.count = 1;
    }

    console.log(req.session.count);
    res.send(req.session.count.toString());
});

router.get("/register", (req, res) => {
    const { name = "anonymous" } = req.query;
    console.log(req.session);
    req.session.name = name;
    req.flash("success", "user registered successfully!");
    res.redirect("/hello");
});

router.get("/hello", (req, res) => {
    res.locals.msg = req.flash("success");
    res.render("localfile.ejs", { name: req.session.name });
    console.log(req.session);
});

module.exports = router;
