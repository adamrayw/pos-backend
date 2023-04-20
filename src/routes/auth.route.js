const express = require('express');
const router = express.Router()
const authController = require('../controllers/auth.controller');

router.post('/daftar', authController.register)
router.post('/login', authController.login)

module.exports = router