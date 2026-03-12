const express = require('express')
const router = express.Router()
const { register, login, getMe, updatePerfil } = require('../controllers/authController')
const { proteger } = require('../middlewares/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', proteger, getMe)
router.put('/perfil', proteger, updatePerfil)

module.exports = router