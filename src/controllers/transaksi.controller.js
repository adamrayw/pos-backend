const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');
const getISONow = require('../utils/getISO.utils');

async function getTransaksiKemarin(req, res) {
    const getISOStart = getISONow()
    /* It's getting the first day of the past month. */
    getISOStart.setUTCHours(0, 0, 0, 0)
    getISOStart.toISOString()

    const getISOEnd = getISONow()
    getISOEnd.setUTCHours(23, 59, 59, 59)
    getISOEnd.toISOString()

    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: getISOStart,
                            lte: getISOEnd
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
    /* It's getting the first day of the past month. */
    const startOfMonth = getISONow()
    startOfMonth.setUTCHours(0, 0, 0, 0)
    startOfMonth.setDate('1')
    startOfMonth.toISOString()

    const endOfMonth = getISONow()
    endOfMonth.setUTCHours(23, 59, 59, 59)
    endOfMonth.toISOString()

    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: startOfMonth,
                            lte: endOfMonth
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
    const todayISO = getISONow()
    todayISO.setHours(0, 0, 0, 0)
    todayISO.toISOString()

    const todayISO0Hourse = getISONow()
    todayISO0Hourse.setUTCHours(23, 59, 59, 0)
    todayISO0Hourse.toISOString()
    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: todayISO,
                            lte: todayISO0Hourse
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
    const now = getISONow()
    /* It's getting the first day of the past month. */
    const startOfMonth = new Date(now.getFullYear(), now.getMonth()).toISOString();

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()


    try {
        const response = await prisma.transaksi.findMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            /* It's getting the first day of the past month. */
                            gte: startOfMonth,
                            lte: endOfMonth,
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
                'time': getISONow(),
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
                createdAt: getISONow()

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