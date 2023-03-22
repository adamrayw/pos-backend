const express = require('express');
const transaksiController = require('../controllers/transaksi.controller');
const router = express.Router()

router.post('/post', transaksiController.postTransaksi)

module.exports = router