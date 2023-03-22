const express = require('express');
const Multer = require('multer');
const router = express.Router()
const kategoriController = require('../controllers/kategori.controller')

const storage = new Multer.memoryStorage()
const upload = Multer({
    storage,
})

// Get Menus
router.get('/', kategoriController.getKategori)
router.post('/add', kategoriController.addKategori)
router.delete('/remove', kategoriController.remove)
router.get('/getbyid/:id', kategoriController.getById)
// router.post('/add', upload.single("image"), menuController.addItem)
// router.put('/edit', upload.single("image"), menuController.edit)

module.exports = router