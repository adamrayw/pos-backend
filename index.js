const express = require('express');
const app = express()
const bodyParser = require('body-parser')
const menuRouter = require('./src/routes/menu.route')
const kategoriRouter = require('./src/routes/kategori.route')
const transaksiRouter = require('./src/routes/transaksi.route')
const authRouter = require('./src/routes/auth.route')
const userRouter = require('./src/routes/user.route')
const cors = require('cors');
const multer = require('multer');
const upload = multer()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)

app.use('/api/menu', menuRouter)
app.use('/api/kategori', kategoriRouter)
app.use('/api/transaksi', transaksiRouter)
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.json({ 'message': 'ok' })
})

// Logging the rejected field from multer error
app.use((error, req, res, next) => {
    console.log('This is the rejected field ->', error.field);
});

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ 'message': err.message });

    return;
});


app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running...`)
})