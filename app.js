if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const path = require("path");
const express = require("express");
const ejsmate = require("ejs-mate");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const User = require("./models/user.js");
const loginRouter = require("./routes/login_route.js");
const signupRouter = require("./routes/signup_route.js");
const productDetailRouter = require("./routes/product_detail.js");
const homeRoutes = require("./routes/homeRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const debugRoutes = require("./routes/debugRoutes.js");

const app = express();

const sessionOption = {
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(cookieParser("school"));
app.use(session(sessionOption));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const mongourl=process.env.MONGO_API || "mongodb://127.0.0.1:27017/APB"
mongoose.connect(mongourl)
    .then(() => console.log("Connected!",mongourl))
    .catch((err) => {
        console.log("error occur in database connection : ", err);
    });

if (process.env.RENDER_EXTERNAL_URL) {
    const KEEP_ALIVE_URL = `${process.env.RENDER_EXTERNAL_URL}/health`;
    const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

    setInterval(async () => {
        try {
            await fetch(KEEP_ALIVE_URL);
        } catch (_) {
            // Non-critical — don't crash if the ping fails
        }
    }, INTERVAL_MS);

    console.log(`[keep-alive] pinging ${KEEP_ALIVE_URL} every 14 min`);
}


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.review = req.flash("review");
    res.locals.deleteReview = req.flash("deleteReview");
    res.locals.addProduct = req.flash("addProduct");
    res.locals.register = req.flash("register");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.cartArray = req.session.cartArray || [];
    next();
});

app.get("/",(req,res)=>{
    res.redirect("/apb/home");
})
app.use("/apb/login", loginRouter);
app.use("/apb/signup", signupRouter);
app.use(homeRoutes);
app.use(productRoutes);
app.use(debugRoutes);
app.use("/apb/fullproduct/:id", productDetailRouter);

app.listen(8081, () => {
    console.log("we are listening on port no 8081");
});

module.exports = app;