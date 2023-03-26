const prisma = require('../services/prisma.service')
const cloudinary = require('../../src/services/cloudinary.service')

async function getAllItem(req, res, next) {
    try {
        const response = await prisma.item.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        res.json({ 'items': response })
    } catch (error) {
        console.log(error)
        next(error)
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

async function addItem(req, res, next) {
    const { name, price, kategoriId } = req.body
    let imageUrl = ''

    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64")
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64
        imageUrl = await uploadImage(dataURI)
    } catch (error) {
        console.log(error.message)
    }

    try {
        await prisma.item.create({
            data: {
                name,
                price: parseInt(price),
                image: imageUrl,
                kategoriId

            }
        })

        res.json({ 'message': 'success' })
    } catch (error) {
        console.log(`Error while creating menu`, error.message)
        next(error)
    }
}

async function edit(req, res) {
    const { id, image, name, price, imageEdited, kategoriId } = req.body

    let imageUrl = ''

    if (imageEdited === true || imageEdited === 'true') {
        try {
            const b64 = Buffer.from(req.file.buffer).toString("base64")
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64
            imageUrl = await uploadImage(dataURI)
        } catch (error) {
            console.log(error.message)
        }
    }

    try {
        await prisma.item.update({
            where: {
                id
            },
            data: {
                name,
                price: parseInt(price),
                image: (imageEdited === true || imageEdited === 'true' ? imageUrl : image),
            }
        })

        res.json({ 'message': 'item successfully edited!' })
    } catch (err) {
        console.log(err)
    }
}

async function remove(req, res) {
    const body = req.body

    try {
        await prisma.item.delete({
            where: {
                id: body.id
            }
        })

        res.json({ 'message': 'item successfully deleted!' })
    } catch (error) {
        console.log(error)
    }
}

async function search(req, res) {
    const query = req.params.query

    try {
        const response = await prisma.item.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            }
        })
        // console.log(response)
        res.json({ 'items': response })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAllItem,
    addItem,
    edit,
    remove,
    search
}