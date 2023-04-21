const prisma = require('../services/prisma.service')

const getDashboard = async (req, res) => {
    const id = req.params.id

    try {
        const response = await prisma.user.findUnique({
            where: {
                id: id
            },
            include: {
                subscriptions: true
            }
        })

        res.json({
            status: 200,
            status_text: "success",
            response
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getDashboard
}