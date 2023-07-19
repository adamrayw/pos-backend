const express = require('express');
const router = express.Router()
const authController = require('../controllers/auth.controller');

router.post('/daftar', authController.register)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)

module.exports = router