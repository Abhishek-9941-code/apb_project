const express = require("express");
const User = require("../models/user");
const router = express.Router();
let {callBackGet,callBackPost} = require("../controllers/signup_route")
router.get("/",callBackGet);

router.post("/",callBackPost);

// app.get("/apb/signup",(req, res)=>{
//     res.render("sign_up/signup.ejs")
// })

module.exports = router;

// app.get("/demouser", async (req,res)=>{
//     let fakeUser = new User({
//         username: "abhishek123",
//         email: "abhishek@gmail.com",
//         first_name: "abhishek",
//         last_name: "saini"
//     })
//     let registeredUser = await User.register(fakeUser,"abhishek123");
//     res.send(registeredUser);
// })