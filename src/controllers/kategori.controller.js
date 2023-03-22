const prisma = require('../services/prisma.service')
const cloudinary = require('../../src/services/cloudinary.service')

async function getKategori(req, res, next) {
    try {
        const response = await prisma.kategori.findMany()

        res.json({ 'items': response })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

async function addKategori(req, res, next) {
    const kategori = req.body

    try {
        await prisma.kategori.create({
            data: {
                name: kategori.name
            }
        })

        res.json({ 'message': 'kategori successfully added!' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

async function remove(req, res) {
    const kategori = req.body

    try {
        await prisma.kategori.delete({
            where: {
                id: kategori.id
            }
        })

        res.json({ 'message': 'kategori successfully deleted!' })
    } catch (error) {
        console.log(error)
    }
}

async function getById(req, res) {
    try {
        const response = await prisma.kategori.findUnique({
            where: {
                id: req.params['id'],
            },
            include: {
                items: true
            }
        })

        res.json({ 'items': response })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getKategori,
    addKategori,
    remove,
    getById
}