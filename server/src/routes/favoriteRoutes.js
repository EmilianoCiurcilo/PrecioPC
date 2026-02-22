const express = require('express')
const router = express.Router()
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController')
const { proteger } = require('../middlewares/authMiddleware')

router.get('/', proteger, getFavorites)
router.post('/', proteger, addFavorite)
router.delete('/:productoId', proteger, removeFavorite)

module.exports = router