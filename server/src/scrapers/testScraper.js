require('dotenv').config()
const mongoose = require('mongoose')
const scrapeCompraGamer = require('./compraGamer')

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB conectado')
    await scrapeCompraGamer()
    process.exit(0)
  })