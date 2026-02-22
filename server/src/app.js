const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const productRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const favoriteRoutes = require('./routes/favoriteRoutes')


dotenv.config()
connectDB()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoriteRoutes)

app.use('/api/products', productRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'PcArgentina API funcionando' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})