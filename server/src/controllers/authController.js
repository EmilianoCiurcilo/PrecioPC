import 'dotenv/config'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generarToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body
    const existeUsuario = await User.findOne({ email })
    if (existeUsuario) return res.status(400).json({ error: 'El email ya está registrado' })
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const usuario = await User.create({ nombre, email, password: passwordHash })
    res.status(201).json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, token: generarToken(usuario._id) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const usuario = await User.findOne({ email })
    if (!usuario) return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    const passwordValida = await bcrypt.compare(password, usuario.password)
    if (!passwordValida) return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    res.json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, token: generarToken(usuario._id) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getMe = async (req, res) => {
  res.json(req.usuario)
}

export const updatePerfil = async (req, res) => {
  try {
    const { nombre } = req.body
    const usuario = await User.findByIdAndUpdate(req.usuario._id, { nombre }, { new: true, select: '-password' })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
 