const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');
// const getISONow = require('../utils/getISO.utils');
const getSubscriptionDate = require('../utils/getSubscriptionDate.util');

async function getTransaksiKemarin(id) {
    const yesterday = new Date();
    const beginningOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 1, 23, 59, 59, 999);


    /* The above code is creating a JavaScript function that retrieves the current date and time and
    formats it into a string in the format "YYYY-MM-DD HH:MM:SS". It uses the `Date` object to get
    the current date and time, and then uses various methods to extract the year, month, day, hours,
    minutes, and seconds from the `Date` object. It also uses the `padStart` method to ensure that
    each component of the date and time is two digits long, adding a leading zero if necessary.
    Finally, it concatenates all the components into a single string and */
    function getCurrentDateTime() {

        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        return formattedDateTime

    }

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
                    take: 5,
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
    const paymentMethod = req.params.paymentMethod

    const id = generateTransactionID()
    if (paymentMethod === 'midtrans') {


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
    } else if (paymentMethod === 'cash') {
        try {
            const response = await prisma.transaksi.create({
                data: {
                    transaksiId: id,
                    menu: {
                        set: dataTransaksi.data.menu
                    },
                    total: dataTransaksi.data.total,
                    token: '-',
                    redirect_url: '-',
                    isPaid: true,
                    userId,
                    rincian: {
                        "order_id": id,
                        "payment_type": "Cash",
                        "transaction_time": getCurrentDateTime(),
                        "transaction_status": "settlement",
                    }

                }
            })

            res.json(
                {
                    "message": "Payment Success!",
                    "data": response
                }
            )
        } catch (error) {
            console.log(error)
        }
    }


}

async function handling(req, res) {
    const responseFromMidtrans = req.body

    console.log(responseFromMidtrans)

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

        /* The above code is checking if a transaction exists and if it has been paid. If the
        transaction has not been paid, it updates the transaction status based on the response from a
        payment gateway (Midtrans). If the transaction has already been paid, it logs a message
        saying "Transaksi sudah dibayar" (which means "Transaction has already been paid" in
        Indonesian). The code is using the Prisma ORM to update the transaction status in a database. */
        if (getTransaction !== null) {
            if (getTransaction.isPaid === false) {
                try {
                    await prisma.transaksi.update({
                        where: {
                            id: getTransaction.id
                        },
                        data: {
                            isPaid: responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement' ? true : false,
                            rincian: responseFromMidtrans
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            } else {
                console.log("Transaksi sudah dibayar")
            }
        }

        /* The above code is checking if a transaction subscription exists and if it has been paid. If
        it has not been paid, it updates the subscription data in the database based on the response
        from a payment gateway (Midtrans). It sets the subscription as paid and active if the
        transaction status is 'capture' or 'settlement', and sets the expiration date for the
        subscription. It also updates the expiration date for the user associated with the
        subscription. If the subscription has already been paid, it logs a message saying that the
        transaction has already been paid. */
        if (getTransactionSubs !== null) {
            if (getTransactionSubs.isPaid === false) {
                try {
                    await prisma.subscriptions.update({
                        where: {
                            id: getTransactionSubs.id
                        },
                        data: {
                            isPaid: responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement' ? true : false,
                            isActived: responseFromMidtrans.transaction_status === 'capture' || responseFromMidtrans.transaction_status === 'settlement' ? true : false,
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