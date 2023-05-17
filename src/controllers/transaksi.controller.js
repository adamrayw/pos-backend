const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');
// const getISONow = require('../utils/getISO.utils');
const getSubscriptionDate = require('../utils/getSubscriptionDate.util');

async function getTransaksiKemarin(id) {
    const yesterday = new Date();
    const beginningOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 1, 23, 59, 59, 999);

    console.log(id)

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: beginningOfYesterday,
                            lte: endOfYesterday
                        },
                        isPaid: true,
                    },
                },
            },
        });

        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiBulanKemarin(id) {
    const currentDate = new Date();
    const beginningOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: beginningOfLastMonth,
                            lte: endOfLastMonth,
                        },
                        isPaid: true,
                    },
                },
            },
        });


        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiHariIni(id) {
    const currentDate = new Date();
    const beginningOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: beginningOfDay,
                            lte: endOfDay
                        },
                        isPaid: true,
                    },
                },
            },
        });


        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksiBulanIni(id) {
    const currentDate = new Date();
    const beginningOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            /* It's getting the first day of the past month. */
                            gte: beginningOfThisMonth,
                            lte: endOfThisMonth
                        },
                        isPaid: true,
                    },
                },
            },
        });

        return response
    } catch (error) {
        console.log(error)
    }
}

async function getTransaksi(req, res) {
    const id = await req.params.id

    try {
        const response = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                Transaksi: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        const trtoday = await getTransaksiHariIni(id)
        const trmonth = await getTransaksiBulanIni(id)
        const tryesterday = await getTransaksiKemarin(id)
        const tryesterdaymonth = await getTransaksiBulanKemarin(id)

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
    const userId = req.params.id

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
            transaction_details: {
                order_id: id,
                gross_amount: dataTransaksi.data.total
            },
            credit_card: {
                secure: true
            },
            items_details: [{
                category: "menu"
            }]
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
                userId

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
        const getTransaction = await prisma.transaksi.findFirst({
            where: {
                transaksiId: responseFromMidtrans.order_id
            }
        })

        const getTransactionSubs = await prisma.subscriptions.findFirst({
            where: {
                transaksiId: responseFromMidtrans.order_id
            },
            include: {
                user: true
            }
        })

        if (getTransaction !== null) {
            if (getTransaction.isPaid === false) {
                try {
                    await prisma.transaksi.update({
                        where: {
                            id: getTransaction.id
                        },
                        data: {
                            isPaid: (responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement') ? true : false
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            } else {
                console.log("Transaksi sudah dibayar")
            }
        }

        if (getTransactionSubs !== null) {
            if (getTransactionSubs.isPaid === false) {
                console.log(getTransactionSubs.type)
                try {
                    await prisma.subscriptions.update({
                        where: {
                            id: getTransactionSubs.id
                        },
                        data: {
                            isPaid: (responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement') ? true : false,
                            isActived: true,
                            expired: getSubscriptionDate(getTransactionSubs.type),
                            user: {
                                update: {
                                    expired: getSubscriptionDate(getTransactionSubs.type),
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.log(error)
                }
            } else {
                console.log("Transaksi sudah dibayar")
            }
        }

    } catch (error) {
        console.log(error)
    }

}

const subscribe = async (req, res) => {
    const { userId, price, nama_paket, type } = req.body

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
            transaction_details: {
                order_id: id,
                gross_amount: price
            },
            credit_card: {
                secure: true
            },
            items_details: [{
                category: "menu"
            }]
        }
    }

    const isHaveActiveSubscription = await prisma.subscriptions.findFirst({
        where: {
            user: {
                id: userId
            },
            isActived: true
        }
    })

    if (isHaveActiveSubscription !== null) {
        res.status(400).json(
            {
                "message": "Anda sudah memiliki langganan aktif!",
                "data": isHaveActiveSubscription
            }
        )
        return
    }

    const { token, redirect_url } = await axios.request(options)
        .then((response) => {
            return response.data
        })
        .then((error) => {
            return error
        })


    try {
        const response = await prisma.subscriptions.create({
            data: {
                user: { connect: { id: userId } },
                transaksiId: id,
                price: price,
                token,
                type: nama_paket,
                expired: new Date(),
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

module.exports = {
    getTransaksi,
    postTransaksi,
    handling,
    getTransaksiHariIni,
    getTransaksiKemarin,
    getTransaksiBulanKemarin,
    subscribe
}