const express = require('express');
const router = express.Router()
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authentication.middleware');

router.get('/dashboard/:id', authenticateToken, userController.getDashboard)
router.get('/checkSubscription/:id', authenticateToken, userController.checkSubscription)

module.exports = router