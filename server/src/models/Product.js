const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  marca: { type: String },
  categoria: { type: String },
  precio: { type: Number, required: true },
  precioAnterior: { type: Number },
  descuento: { type: Number, default: 0 },
  tienda: { type: String, required: true },
  url: { type: String },
  imagen: { type: String },
  stock: { type: Boolean, default: true },
  specs: { type: Object, default: {} },
  ultimaActualizacion: { type: Date, default: Date.now }
}, { timestamps: true })

productSchema.index({ nombre: 1, tienda: 1 }, { unique: true })
module.exports = mongoose.model('Product', productSchema)