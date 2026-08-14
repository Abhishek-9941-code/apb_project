const express = require("express");
const router = express.Router({mergeParams: true});
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const {getCallback,postCallback} = require("../controllers/login.js");

router.get("/",getCallback)


router.post("/", saveRedirectUrl,passport.authenticate("local", { failureRedirect: "/apb/login", failureFlash: true }),postCallback)

module.exports = router;