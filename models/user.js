const mongoose = require("mongoose")
const plm = require("passport-local-mongoose").default;

const userschema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
})

userschema.plugin(plm)

module.exports=mongoose.model("User",userschema);