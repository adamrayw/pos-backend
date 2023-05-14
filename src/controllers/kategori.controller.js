const prisma = require('../services/prisma.service')
const cloudinary = require('../../src/services/cloudinary.service')

async function getKategori(req, res, next) {
    try {
        const response = await prisma.user.findUnique({
            where: {
                id: req.params['id'],
            },
            include: {
                Kategori: true
            }
        })

        res.json({ 'items': response.Kategori })
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
                name: kategori.name,
                userId: kategori.userId
            }
        })

        res.json({ 'message': 'kategori successfully added!' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

async function remove(req, res) {
    const kategori = req.params.id

    try {
        await prisma.kategori.delete({
            where: {
                id: kategori
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

async function edit(req, res) {
    const { id, name } = req.body

    try {
        await prisma.kategori.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        })

        res.json({ 'message': 'kategori successfully edited!' })
    } catch (err) {
        console.log(err)
    }
}
module.exports = {
    getKategori,
    addKategori,
    remove,
    getById,
    edit
}