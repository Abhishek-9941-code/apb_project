const User = require("../models/user.js");

module.exports.callBackGet = (req,res)=>{
    res.render("sign_up/signup.ejs");
};

module.exports.callBackPost = async (req,res,next)=>{
    try{
        console.log(req.body);
    const {
        username,
        email,
        password,
        first_name,
        last_name,
    } = req.body;

    if (!username || !first_name || !email || !password) {
        req.flash("register", "Please fill all required fields.");
        return res.redirect("/apb/signup");
    }

    const newUserData = {
        username,
        first_name,
        email,
        role: 'user'
    };
    if (last_name) newUserData.last_name = last_name;

    const newUser = new User(newUserData);

    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to APB");
        res.redirect("/apb/home");
    });
    console.log(registeredUser);
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/apb/signup")
    }
};