const Product = require('../models/Product')

const getProducts = async (req, res) => {
  try {
    const {
      categoria,
      tienda,
      marca,
      precioMin,
      precioMax,
      orden,
      busqueda,
      page = 1,
      limit = 20
    } = req.query

    // Construimos el filtro dinámicamente
    const filtro = {}

    if (categoria) filtro.categoria = categoria
    if (tienda) filtro.tienda = tienda
    if (marca) filtro.marca = marca
    if (busqueda) filtro.nombre = { $regex: busqueda, $options: 'i' }
    if (precioMin || precioMax) {
      filtro.precio = {}
      if (precioMin) filtro.precio.$gte = Number(precioMin)
      if (precioMax) filtro.precio.$lte = Number(precioMax)
    }

    // Ordenamiento
    const ordenMap = {
      'precio_asc': { precio: 1 },
      'precio_desc': { precio: -1 },
      'nombre_asc': { nombre: 1 },
      'reciente': { ultimaActualizacion: -1 }
    }
    const ordenFinal = ordenMap[orden] || { ultimaActualizacion: -1 }

    // Paginación
    const skip = (Number(page) - 1) * Number(limit)

    const [productos, total] = await Promise.all([
      Product.find(filtro)
        .sort(ordenFinal)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filtro)
    ])

    res.json({
      productos,
      total,
      pagina: Number(page),
      totalPaginas: Math.ceil(total / Number(limit))
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getCategorias = async (req, res) => {
  try {
    const categorias = await Product.distinct('categoria')
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getMarcas = async (req, res) => {
  try {
    const marcas = await Product.distinct('marca')
    res.json(marcas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getProducts, getProductById, getCategorias, getMarcas }