const express = require('express');
const router = express.Router()
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authentication.middleware');

router.get('/dashboard/:id', authenticateToken, userController.getDashboard)

module.exports = router