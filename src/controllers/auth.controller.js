const prisma = require('../services/prisma.service')
const hashPassword = require("../utils/hashPassword");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv');

dotenv.config();

function generateAccessToken(email) {
    return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1800s' })
}

const register = async (req, res) => {
    const { email, nama_usaha, password } = req.body;

    // check if email already exists
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // if email already exists, return error
    if (user !== null) {
        return res.status(400).json({
            status: 400,
            status_text: "error",
            message: "User already exists!"
        })
    }

    // if email doesn't exist, create new user
    try {
        const response = await prisma.user.create({
            data: {
                email,
                nama_usaha,
                password: await hashPassword(password)
            }
        });

        res.status(200).json({
            status: 200,
            status_text: "success",
            message: "User successfully created!",
            data: {
                email: response.email,
                nama_usaha: response.nama_usaha,
                token: generateAccessToken({ email })
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!",
            error
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    // check if email exists
    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        // if email doesn't exist, return error
        if (user === null) {
            return res.status(400).json({
                status: 400,
                status_text: "not found",
                message: "User doesn't exist!"
            })
        }

        // if email exists, check password
        const match = await bcrypt.compare(password, user.password);

        // if password match return user data
        if (match) {
            res.status(200).json({
                status: 200,
                status_text: "success",
                message: "User successfully logged in!",
                data: {
                    id: user.id,
                    email: user.email,
                    nama_usaha: user.nama_usaha,
                    token: generateAccessToken({ email: user.email })
                }
            })
        } else {
            res.status(400).json({
                status: 400,
                status_text: "error",
                message: "Email or password is incorrect!"
            })
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Something went wrong!",
            error
        })
    }
}

module.exports = {
    register,
    login
}