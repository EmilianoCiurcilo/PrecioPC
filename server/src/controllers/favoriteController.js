const Favorite = require('../models/Favorite')

const getFavorites = async (req, res) => {
  try {
    const favoritos = await Favorite.find({ usuario: req.usuario._id })
      .populate('producto')
    res.json(favoritos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const addFavorite = async (req, res) => {
  try {
    const { productoId, precioActual } = req.body

    const favorito = await Favorite.create({
      usuario: req.usuario._id,
      producto: productoId,
      precioAlAgregar: precioActual
    })

    res.status(201).json(favorito)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya está en favoritos' })
    }
    res.status(500).json({ error: error.message })
  }
}

const removeFavorite = async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      usuario: req.usuario._id,
      producto: req.params.productoId
    })
    res.json({ mensaje: 'Eliminado de favoritos' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite }