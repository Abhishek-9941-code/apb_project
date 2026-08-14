// const cloudinary = require(`cloudinary`).v2;
// const { CloudinaryStorage } = require(`multer-storage-cloudinary`);

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET
// });

// console.log(process.env.CLOUD_API_KEY);

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req,file)=> {
//     console.log("Cloudinary storage HIT - file:",file.originalname);
//     return{
//         folder: 'APB folder',
//         allowed_formats: ["png","jpeg","jpg"],
//     };
//   },
// });

// module.exports = {
//     cloudinary,
//     storage,
// }

require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

console.log("Cloud name:", process.env.CLOUD_NAME);
console.log("API key exists:", !!process.env.CLOUD_API_KEY);
console.log("API secret exists:", !!process.env.CLOUD_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "APB folder",
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});

module.exports = {
    cloudinary,
    storage
};