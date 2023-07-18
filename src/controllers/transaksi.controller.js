const prisma = require('../services/prisma.service')
const generateTransactionID = require('../utils/generateId.utils')
const axios = require('axios');
// const getISONow = require('../utils/getISO.utils');
const getSubscriptionDate = require('../utils/getSubscriptionDate.util');
const { DateTime } = require('luxon');

async function getTransaksiKemarin(id) {
    const currentDate = DateTime.now();
    const yesterday = currentDate.minus({ days: 1 });
    const startOfYesterday = yesterday.startOf('day');
    const endOfYesterday = yesterday.endOf('day');

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: startOfYesterday.toISO(),
                            lte: endOfYesterday.toISO()
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
    const currentDate = DateTime.now();
    const lastMonth = currentDate.minus({ months: 1 });
    const firstDayOfLastMonth = lastMonth.startOf('month');
    const lastDayOfLastMonth = lastMonth.endOf('month');

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: firstDayOfLastMonth.toISO(),
                            lte: lastDayOfLastMonth.toISO(),
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
    const currentDate = DateTime.local();
    const beginningOfDay = currentDate.startOf('day');

    try {
        const response = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                Transaksi: {
                    where: {
                        createdAt: {
                            gte: beginningOfDay.toJSDate(),
                        },
                        isPaid: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });

        return response;
    } catch (error) {
        console.log(error);
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
                    orderBy: {
                        createdAt: 'desc'
                    }
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
                        order_id: id,
                        payment_type: "Cash",
                        transaction_time: getCurrentDateTime(),
                        transaction_status: "settlement",
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

const getFilteredTransaction = async (req, res) => {
    const userId = req.params.id;

    try {
        const startMonth = parseInt(req.params.start); // Convert start month to integer
        const endMonth = parseInt(req.params.end); // Convert end month to integer

        // Validate the input month values
        if (
            isNaN(startMonth) ||
            isNaN(endMonth) ||
            startMonth < 0 ||
            startMonth > 11 ||
            endMonth < 0 ||
            endMonth > 11
        ) {
            return res.status(400).json({ message: 'Invalid month range' });
        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const response = await prisma.transaksi.findMany({
            where: {
                userId: userId, // Filter transactions by userId
            },
        });

        const filteredTransactions = response.filter((transaction) => {
            const transactionDate = new Date(transaction.createdAt);
            const transactionMonth = transactionDate.getMonth();
            const transactionYear = transactionDate.getFullYear();

            // Check if the transaction falls within the desired date range
            if (transactionYear === currentYear) {
                // If the transaction year is the same as the current year, compare the month
                return transactionMonth >= startMonth && transactionMonth <= endMonth;
            } else if (transactionYear > currentYear) {
                // If the transaction year is greater than the current year, include it
                return true;
            }

            return false;
        });

        res.json({
            message: 'Success',
            data: filteredTransactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = {
    getTransaksi,
    postTransaksi,
    handling,
    getTransaksiHariIni,
    getTransaksiKemarin,
    getTransaksiBulanKemarin,
    subscribe,
    getFilteredTransaction
}