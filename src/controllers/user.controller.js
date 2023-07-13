const prisma = require('../services/prisma.service')

const getUserData = async (req, res) => {
    const id = req.params.id

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
        })

        res.status(200).json({
            status: 200,
            status_text: "success",
            data: user
        })
    } catch (error) {
        console.log(error)
    }

}

const updateUserData = async (req, res) => {
    const id = req.params.id
    const { nama_usaha, pic, kontak_toko, lokasi_toko } = req.body

    try {
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                nama_usaha,
                pic,
                kontak: kontak_toko,
                alamat: lokasi_toko
            }
        })

        res.status(200).json({
            status: 200,
            status_text: "success",
            data: user
        })
    } catch (error) {
        console.log(error)
    }
}

const getDashboard = async (req, res) => {
    const id = req.params.id

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
            include: {
                subscriptions: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },

        })

        const now = new Date()

        const expiredSubscriptions = await user.subscriptions.filter((subscription) => {
            const expiredDate = new Date(subscription.expired)
            return expiredDate < now
        })

        if (expiredSubscriptions.length > 0) {
            await prisma.subscriptions.updateMany({
                where: {
                    id: {
                        in: expiredSubscriptions.map((subscription) => subscription.id)
                    }
                },
                data: {
                    isActived: false,
                }
            })

            await prisma.user.updateMany({
                where: {
                    subscriptions: {
                        some: {
                            id: {
                                in: expiredSubscriptions.map((subscription) => subscription.id)
                            }
                        }
                    }
                },
                data: {
                    expired: null
                }
            });
        }

        res.json({
            status: 200,
            status_text: "success",
            response: user
        })
    } catch (error) {
        console.log(error)
    }
}

const checkSubscription = async (req, res) => {
    const id = req.params.id

    const response = await prisma.subscriptions.findFirst({
        where: {
            userId: id,
            isActived: true
        }
    })

    if (response === null) {
        res.json({
            status: 404,
            status_text: "not found",
            isHaveActiveSubscription: false,
            message: "User doesn't have active subscription!"
        })
    } else {
        res.json({
            status: 200,
            status_text: "success",
            isHaveActiveSubscription: true,
            message: "User have active subscription!",
            data: response
        })
    }
}

module.exports = {
    getDashboard,
    checkSubscription,
    getUserData,
    updateUserData
}