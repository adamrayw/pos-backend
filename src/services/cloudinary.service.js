const cloudinary = require('cloudinary').v2;

cloudinary.config({
    secure: "https"
})

module.exports = cloudinary