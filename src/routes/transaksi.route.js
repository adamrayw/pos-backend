const express = require('express');
const transaksiController = require('../controllers/transaksi.controller');
const router = express.Router()

router.get('/get', transaksiController.getTransaksi)
router.post('/post', transaksiController.postTransaksi)
router.post('/handling', transaksiController.handling)

module.exports = router