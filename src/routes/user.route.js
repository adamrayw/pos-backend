const express = require('express');
const router = express.Router()
const Multer = require('multer');
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authentication.middleware');

const storage = new Multer.memoryStorage()
const upload = Multer({
    storage,
})


router.get('/dashboard/:id', authenticateToken, userController.getDashboard)
router.get('/checkSubscription/:id', authenticateToken, userController.checkSubscription)
router.get('/:id', userController.getUserData)
router.post('/update/:id', authenticateToken, upload.single("file"), userController.updateUserData)

module.exports = router