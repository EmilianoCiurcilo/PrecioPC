const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProductById,
  getCategorias,
  getMarcas
} = require('../controllers/productController')

router.get('/', getProducts)
router.get('/categorias', getCategorias)
router.get('/marcas', getMarcas)
router.get('/:id', getProductById)

module.exports = router