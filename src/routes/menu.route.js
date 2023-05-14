const express = require('express');
const Multer = require('multer');
const router = express.Router()
const menuController = require('../controllers/menu.controller')
const authenticateToken = require('../middlewares/authentication.middleware');

const storage = new Multer.memoryStorage()
const upload = Multer({
    storage,
})

// Get Menus
router.get('/:id', authenticateToken, menuController.getAllItem)
router.post('/add', authenticateToken, upload.single("image"), menuController.addItem)
router.put('/edit', authenticateToken, upload.single("image"), menuController.edit)
router.delete('/remove/:id', authenticateToken, menuController.remove)
router.get('/search/:id/:query', authenticateToken, menuController.search)

module.exports = router