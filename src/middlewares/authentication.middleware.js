const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }

    try {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                // Check if token is expired
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                } else {
                    return res.sendStatus(403);
                }
            }

            req.user = user;

            next();
        });
    } catch (error) {
        // Handle JWT malformed error
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Handle other errors
        console.error(error);
        return res.sendStatus(500);
    }
}


module.exports = authenticateToken