const express = require("express")
const ejsmate = require("ejs-mate")
const app = express()
const path = require("path")

const multer  = require('multer')
const upload = multer({ dest: 'public/uploads/' })
// const User=require("./models/user.js")
// const passport = require("passport")
// const pass_local = require("passport-local")
// const pass_local_mongoose = require("passport-local-mongoose")

const mongoose = require('mongoose');
const product=require("./models/product.js")
main()
.then(() => console.log('Connected!'))
.catch((err)=>{
    console.log("error occur in database connection : ",err)
})

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/APB")
}



app.listen(8080,()=>{
    console.log("we are listening on port no 8080")
})
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname,"Public")))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsmate)


app.get("/apb/login",(req,res)=>{
    res.render("sign_up/login.ejs")
})

app.get("/root",(req , res)=>{
    res.render("sign_up/login.ejs")
})

app.get("/apb/signup",(req, res)=>{
    res.render("sign_up/signup.ejs")
})

app.post("/apb/login",(req,res)=>{
    console.log(req.body);
})

app.post("/apb/signup",(req,res)=>{
    console.log(req.body);
    res.render("sign_up/login.ejs")
})


app.get("/apb/home",(req,res)=>{
    res.render("listing/home.ejs")
    })
    
app.get("/apb/top_product",async (req,res)=>{
    const data = await product.find({Category : "books"})
    res.render("listing/top_products.ejs",{data})
})

app.get("/apb/add_product",(req,res)=>{

    res.render("listing/addproduct.ejs")
})

app.post("/product/add",upload.single('image'),async (req,res)=>{
    const data=req.body
    const file=req.file
    const new_product=await product.insertOne({
        ...data,
        image: "/uploads/"+file.filename
    });
    console.log(new_product)
    res.redirect("/apb/add_product")
})
    
    /**tempory code for understanding */
    // const cookieParser = require("cookie-parser")
    // const session = require("express-session");
    // const flash = require("connect-flash")
    // const sessionOptions = {
    //     secret: "mysupersecretstring",
    //     resave : false,
    //     saveUninitialized: true,
    // }
    // app.use(session(sessionOptions))
    // app.use(cookieParser())
    // app.use(flash());
    // app.get("/getcookies",(req,res)=>{
    //     res.cookie("greet","hello");
    //     res.send("sent you some cookies!");
    //     console.log(req.cookies)
    // })
    
    // app.get("/register",(req,res)=>{
    //     let {name = "anonymous"} = req.query;
    //     req.session.name = name;
    //     console.log(req.session)
    //     res.send(name);
    //     // res.redirect("/hello");
    // })
    
    // app.get("/hello",(req,res)=>{
    //     res.send(`hello, ${req.session.name}`)
    // })
    
