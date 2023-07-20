const express = require('express');
const router = express.Router()
const authController = require('../controllers/auth.controller');
const Multer = require('multer');
const storage = new Multer.memoryStorage()
const upload = Multer({
    storage,
})

router.post('/daftar', upload.single("file"), authController.register)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)

module.exports = router