const prisma = require('../services/prisma.service')
const hashPassword = require("../utils/hashPassword");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv');

dotenv.config();


/**
 * The function generates a JSON Web Token (JWT) access token with a one-day expiration time based on
 * the provided email and a secret key stored in an environment variable.
 * @param email - The email parameter is the email address of the user for whom the access token is
 * being generated. This email will be used as the payload of the JSON Web Token (JWT).
 * @returns a JSON Web Token (JWT) that has been signed with a secret key and will expire after one
 * day. The payload of the JWT is the email parameter that is passed into the function.
 */
function generateAccessToken(email) {
    return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1d' })
}

/**
 * This function registers a new user by checking if the email already exists, creating a new user if
 * it doesn't, and returning an error if it does.
 * @returns The `register` function returns a response object with a status code, status text, message,
 * and data. The status code and status text indicate whether the request was successful or not. If the
 * email already exists, the function returns an error message. If the email doesn't exist, the
 * function creates a new user and returns a success message with the user's email, business name, and
 * a token
 */
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
                id: user.id,
                email: user.email,
                nama_usaha: user.nama_usaha,
                token: generateAccessToken({ email: user.email }),
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!",
            error
        })
    }
}

/**
 * This is a login function that checks if the email exists, verifies the password, and returns user
 * data if successful.
 * @returns The code is a function called `login` that handles a POST request to log in a user. It
 * checks if the email exists in the database, and if it does, it checks if the password matches. If
 * the password matches, it returns a JSON response with the user's data and a generated access token.
 * If the email doesn't exist or the password doesn't match, it returns an error
 */
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
                    token: generateAccessToken({ email: user.email }),
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
            message: "Something wents wrong!",
            error
        })
    }
}

module.exports = {
    register,
    login
}