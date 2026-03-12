import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/useAuth'
import axios from 'axios'

const API = 'http://localhost:3001/api'

function Profile() {
  const navigate = useNavigate()
  const { usuario, login, logout } = useAuth()

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  if (!usuario) {
    navigate('/login')
    return null
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) return setError('El nombre no puede estar vacío')
    setLoading(true)
    setError('')
    try {
      const res = await axios.put(`${API}/auth/perfil`,
        { nombre },
        { headers: { Authorization: `Bearer ${usuario.token}` } }
      )
      login({ ...usuario, nombre: res.data.nombre })
      setExito('Perfil actualizado')
      setEditando(false)
      setTimeout(() => setExito(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const inicial = usuario.nombre?.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: '#08080f', color: 'white' }}>
      <Navbar />

      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white' }}>
            {inicial}
          </div>
          <h1 className="text-xl font-black text-white">{usuario.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">{usuario.email}</p>
          <span className="mt-2 text-xs px-3 py-1 rounded-full border border-white/10 text-gray-500">
            {usuario.rol === 'admin' ? '⚡ Admin' : '👤 Usuario'}
          </span>
        </div>

        {/* Card datos */}
        <div className="rounded-2xl border border-white/5 p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Datos de la cuenta
          </p>

          <div className="flex flex-col gap-4">

            {/* Nombre */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
              {editando ? (
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white border border-violet-500 focus:outline-none"
                  style={{ background: 'rgba(124,58,237,0.1)' }}
                  autoFocus
                />
              ) : (
                <p className="text-sm text-white py-2.5">{usuario.nombre}</p>
              )}
            </div>

            {/* Email (no editable) */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <p className="text-sm text-gray-400 py-2.5">{usuario.email}</p>
            </div>

          </div>

          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          {exito && <p className="text-xs text-emerald-400 mt-3">✓ {exito}</p>}

          <div className="flex gap-3 mt-6">
            {editando ? (
              <>
                <button onClick={handleGuardar} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                  style={{ background: '#7c3aed', color: 'white' }}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button onClick={() => { setEditando(false); setNombre(usuario.nombre); setError('') }}
                  className="px-5 py-2.5 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setEditando(true)}
                className="px-5 py-2.5 rounded-xl text-sm border border-white/10 text-gray-400 hover:border-violet-500 hover:text-violet-400 transition">
                Editar nombre
              </button>
            )}
          </div>
        </div>

        {/* Links rápidos */}
        <div className="rounded-2xl border border-white/5 p-6 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Accesos rápidos
          </p>
          <div className="flex flex-col gap-1">
            <button onClick={() => navigate('/favoritos')}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition text-left">
              <span>♡</span>
              <span>Mis favoritos</span>
              <span className="ml-auto text-gray-700">→</span>
            </button>
            <button onClick={() => navigate('/productos')}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition text-left">
              <span>🛍️</span>
              <span>Explorar productos</span>
              <span className="ml-auto text-gray-700">→</span>
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full py-3 rounded-xl text-sm font-semibold border border-red-900/50 text-red-500 hover:bg-red-900/20 transition">
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}

export default Profile