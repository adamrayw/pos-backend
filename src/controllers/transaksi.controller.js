const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');
// const getISONow = require('../utils/getISO.utils');

async function getTransaksiKemarin(req, res) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const beginningOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);


    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: beginningOfYesterday,
                            lte: endOfYesterday
                        }
                    },
                    {
                        isPaid: true
                    }
                ]
            }
        })

        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiBulanKemarin(req, res) {
    const currentDate = new Date();
    const beginningOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: beginningOfLastMonth,
                            lte: endOfLastMonth
                        }
                    },
                    {
                        isPaid: true
                    }
                ]
            }
        })

        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiHariIni(req, res) {
    const currentDate = new Date();
    const beginningOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 0, 0, 0);
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 23, 59, 59, 999);
    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: beginningOfDay,
                            lte: endOfDay
                        }
                    }, {

                        isPaid: true
                    }
                ]
            }
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiBulanIni(req, res) {
    const currentDate = new Date();
    const beginningOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            /* It's getting the first day of the past month. */
                            gte: beginningOfThisMonth,
                            lte: endOfThisMonth
                        },
                    }, {

                        isPaid: true
                    }
                ]
            }
        })

        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksi(req, res) {
    try {
        const response = await prisma.transaksi.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })

        const trtoday = await getTransaksiHariIni()
        const trmonth = await getTransaksiBulanIni()
        const tryesterday = await getTransaksiKemarin()
        const tryesterdaymonth = await getTransaksiBulanKemarin()

        res.json(
            {
                'time': new Date(),
                'items': response,
                'transaction_today': trtoday,
                'transaction_month': trmonth,
                'transaction_yesterday': tryesterday,
                'transaction_last_month': tryesterdaymonth

            }
        )
    } catch (error) {
        console.log(error)
    }
}

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
                transaksiId: id,
                menu: {
                    set: dataTransaksi.data.menu
                },
                total: dataTransaksi.data.total,
                token,
                redirect_url,
                isPaid: false,

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

async function handling(req, res) {
    const responseFromMidtrans = req.body
    try {
        const updatePaymentStatus = await prisma.transaksi.update({
            where: {
                transaksiId: responseFromMidtrans.order_id
            },
            data: {
                isPaid: (responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement' ? true : false)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getTransaksi,
    postTransaksi,
    handling,
    getTransaksiHariIni,
    getTransaksiKemarin,
    getTransaksiBulanKemarin
}