const prisma = require('../services/prisma.service')

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
    checkSubscription
}