const express = require('express');
const router = express.Router()
const kategoriController = require('../controllers/kategori.controller')

// Get Menus
router.get('/', kategoriController.getKategori)
router.post('/add', kategoriController.addKategori)
router.delete('/remove', kategoriController.remove)
router.get('/getbyid/:id', kategoriController.getById)
router.put('/edit', kategoriController.edit)

module.exports = router