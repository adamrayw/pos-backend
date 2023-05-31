const express = require('express');
const transaksiController = require('../controllers/transaksi.controller');
const authenticateToken = require('../middlewares/authentication.middleware');
const router = express.Router()

router.get('/get/:id', authenticateToken, transaksiController.getTransaksi)
router.get('/getTransaksiYesterday', authenticateToken, transaksiController.getTransaksiBulanKemarin)
router.post('/post/:id/:paymentMethod', authenticateToken, transaksiController.postTransaksi)
router.post('/handling', transaksiController.handling)
router.post('/subscribe', authenticateToken, transaksiController.subscribe)

module.exports = router