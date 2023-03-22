const express = require('express');
const Multer = require('multer');
const router = express.Router()
const menuController = require('../controllers/menu.controller')

const storage = new Multer.memoryStorage()
const upload = Multer({
    storage,
})

// Get Menus
router.get('/', menuController.getAllItem)
router.post('/add', upload.single("image"), menuController.addItem)
router.put('/edit', upload.single("image"), menuController.edit)
router.delete('/remove', menuController.remove)
router.get('/search/:query', menuController.search)

module.exports = router