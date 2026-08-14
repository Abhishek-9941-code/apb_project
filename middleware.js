module.exports.isLoggedIn = (req,res,next)=>{
    
    console.log(req.path, "........",req.originalUrl);
        if(!req.isAuthenticated()){
            req.session.redirectUrl =req.originalUrl;
            req.flash("error","you must be logged in to create listing!");
            return res.redirect("/apb/login");
        }
        next();
}
    
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first");
        return res.redirect("/apb/login");
    }

    if (req.user.role !== "owner") {
        req.flash("error", "You are not authorized to perform this action");
        return res.redirect("/apb/home");
    }

    next();
};