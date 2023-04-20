const express = require('express');
const router = express.Router()
const kategoriController = require('../controllers/kategori.controller');
const authenticateToken = require('../middlewares/authentication.middleware');

// Get Menus
router.get('/', authenticateToken, kategoriController.getKategori)
router.post('/add', authenticateToken, kategoriController.addKategori)
router.delete('/remove', authenticateToken, kategoriController.remove)
router.get('/getbyid/:id', authenticateToken, kategoriController.getById)
router.put('/edit', authenticateToken, kategoriController.edit)

module.exports = router