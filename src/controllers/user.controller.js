const prisma = require('../services/prisma.service')
const cloudinary = require('../../src/services/cloudinary.service')



const getUserData = async (req, res) => {
    const id = req.params.id

    console.log(id)

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

async function uploadImage(imagePath) {
    const options = {
        unique_filename: true,
        overwrite: false
    }

    try {
        // upload the image
        const result = await cloudinary.uploader.upload(imagePath, options)
        /* Returning the secure url of the image uploaded to cloudinary. */
        return result.secure_url
    } catch (error) {
        console.log(`Error while uploading image` + error.message)
    }
}

const updateUserData = async (req, res, next) => {
    const id = req.params.id
    const { nama_usaha, pic, kontak_toko, lokasi_toko, qris, isEditImage } = req.body
    let imageUrl = ''

    console.log(qris)
    console.log(isEditImage)

    if (isEditImage === true || isEditImage === 'true') {
        try {
            const b64 = Buffer.from(req.file.buffer).toString("base64")
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64
            imageUrl = await uploadImage(dataURI)
        } catch (error) {
            console.log(error.message)
        }
    }

    try {
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                nama_usaha,
                pic,
                kontak: kontak_toko,
                alamat: lokasi_toko,
                qris: (isEditImage === true || isEditImage === 'true' ? imageUrl : qris),
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