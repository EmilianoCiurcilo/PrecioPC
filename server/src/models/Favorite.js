const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  precioAlAgregar: { type: Number, required: true },
}, { timestamps: true })

// Un usuario no puede tener el mismo producto dos veces
favoriteSchema.index({ usuario: 1, producto: 1 }, { unique: true })

module.exports = mongoose.model('Favorite', favoriteSchema)