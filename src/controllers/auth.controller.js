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
    const { email, nama_usaha, password, pic, kontak, lokasi } = req.body;

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
                pic,
                kontak,
                alamat: lokasi,
                password: await hashPassword(password)
            }
        });

        res.status(200).json({
            status: 200,
            status_text: "success",
            message: "User successfully created!",
            data: {
                id: response.id,
                email: response.email,
                nama_usaha: response.nama_usaha,
                token: generateAccessToken({ email: response.email }),
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
                    alamat: user.alamat,
                    kontak: user.kontak,
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

// EMAIL SEND FORGOT PASSWORD
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // check if email exists
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // if email doesn't exist, return error
    if (user === null) {
        return res.json({
            status: 400,
            status_text: "not found",
            message: "User doesn't exist!"
        })
    }

    const updateToken = await prisma.user.update({
        where: {
            email
        },
        data: {
            reset_password_token: generateAccessToken({ email: user.email })
        }
    })

    // if email exists, send email
    sendForgotPassword(
        user.email,
        user.nama_usaha,
        user.id,
        updateToken.reset_password_token
    )

    res.status(200).json({
        status: 200,
        status_text: "success",
        message: "Link reset password telah dikirim ke email anda!",
    })

}

const resetPassword = async (req, res) => {
    const { password, token, id } = req.body;

    console.log(password, token, id)

    // check if email exists
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    // if email doesn't exist, return error
    if (user === null) {
        return res.json({
            status: 400,
            status_text: "not found",
            message: "User doesn't exist!"
        })
    }

    // if exist, check token
    if (user.reset_password_token === token) {
        // if token match, update password
        const updatePassword = await prisma.user.update({
            where: {
                id
            },
            data: {
                password: await hashPassword(password),
                reset_password_token: null
            }
        })

        res.status(200).json({
            status: 200,
            status_text: "success",
            message: "Password berhasil diubah!",
        })
    }
}

const sendForgotPassword = async (email, nama_usaha, userId, token) => {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
    sendSmtpEmail = {
        sender: {
            name: "NGECASH",
            email: "info@ngecash.id"
        },
        to: [
            {
                email: email,
                name: "User",
            },
        ],
        subject: "Reset Password Link",
        htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Forgot Password</title>
            <style>
              /* Reset some default styles */
              body,
              p {
                margin: 0;
                padding: 0;
                font-family: Arial, Helvetica, sans-serif;
              }
        
              /* Set a background color and font styles */
              body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
              }
        
              /* Main email container */
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
        
              /* Heading styles */
              h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
              }
              a {
                color: white;
              }
              /* Content styles */
              p {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
              }
        
              /* Button styles */
              .btn {
                display: inline-block;
                background-color: #ffffff;
                color: #007bff;
                border: 1px solid #007bff;
                box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
                font-weight: bold;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 16px;
              }
        
              /* Footer styles */
              .footer {
                margin-top: 20px;
                font-size: 14px;
                text-align: center;
              }
              .brand {
                text-align: center;
                color: #007bff;
                font-size: 2em;
              }
        
              .greet {
                font-size: 1.5em;
                color: gray;
              }
              .body {
                text-align: center;
              }
              .message-top {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1 class="brand">NGECASH</h1>
              <!-- <h1>Lupa Password</h1> -->
              <p class="greet">Hallo, ${nama_usaha}</p>
              <p class="message-top">
                A requested has been received to change the password for your NGECASH
                Account.
              </p>
              <div class="body">
                <p><a href=${`https://posku.vercel.app/reset-password/${token}/${userId}`} class="btn">Reset Password</a></p>
              </div>
        
              <p style="color: gray; padding-top: 16px;">
                If you did not submit this request, please ignore this email.
              </p>
              <p style="color: gray; padding-bottom: 40px;">
                Thank You, <br />
                NGECASH Team
              </p>
              <div class="footer">
                <p style="color: gray;">&copy; 2023 NGECASH.</p>
              </div>
            </div>
          </body>
        </html>
        

        `,
    };
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
            console.log("API called successfully. Returned data: " + data);
        },
        function (error) {
            console.error(error);
        }
    );
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
}