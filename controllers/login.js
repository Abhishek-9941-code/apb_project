const user = require("../models/user.js")

module.exports.getCallback = (req,res)=>{
    res.render("sign_up/login.ejs")
};

module.exports.postCallback =  async (req, res) => {
    console.log(req.body);
    req.flash("success","login successful");
    let redirectPage = res.locals.redirectUrl || "/apb/home"
    res.redirect(redirectPage);
}
