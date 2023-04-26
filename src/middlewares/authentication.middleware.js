const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) {
            // Check if token is expired
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' })
            } else {
                return res.sendStatus(403)
            }
        }

        req.user = user

        next()
    })
}

module.exports = authenticateToken