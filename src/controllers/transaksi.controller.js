const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');

async function postTransaksi(req, res) {
    const dataTransaksi = req.body

    const id = generateTransactionID()

    const enocodedMidtransKey = Buffer.from(process.env.SERVER_KEY_MIDTRANS).toString('base64')

    const options = {
        method: "POST",
        url: "https://app.sandbox.midtrans.com/snap/v1/transactions",
        headers: {
            accept: "application/json",
            'content-type': "application/json",
            authorization: "Basic " + enocodedMidtransKey
        },
        data: {
            transaction_details: { order_id: id, gross_amount: dataTransaksi.data.total },
            credit_card: { secure: true }
        }
    }

    const { token, redirect_url } = await axios.request(options)
        .then((response) => {
            return response.data
        })
        .then((error) => {
            return error
        })

    try {
        const response = await prisma.transaksi.create({
            data: {
                transaksiId: generateTransactionID(),
                menu: {
                    set: dataTransaksi.data.menu
                },
                total: dataTransaksi.data.total,
                token,
                redirect_url,
                isPaid: false

            }
        })

        res.json(
            {
                "message": "Payment Link successfully created!",
                "data": response
            }
        )
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    postTransaksi
}