import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/useAuth'
import { getFavorites, removeFavorite } from '../services/productService'

function Favorites() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return navigate('/login')
    getFavorites(usuario.token)
      .then(data => setFavoritos(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [usuario])

  const handleRemove = async (productoId) => {
    try {
      await removeFavorite(productoId, usuario.token)
      setFavoritos(prev => prev.filter(f => f.producto._id !== productoId))
    } catch (err) {
      console.error(err)
    }
  }

  const getPriceStatus = (fav) => {
    const actual = fav.producto.precio
    const alAgregar = fav.precioAlAgregar
    if (!alAgregar || actual === alAgregar) return null
    const diff = actual - alAgregar
    const pct = Math.round((Math.abs(diff) / alAgregar) * 100)
    return diff < 0
      ? { tipo: 'bajo', label: `Bajó ${pct}%`, monto: Math.abs(diff) }
      : { tipo: 'subio', label: `Subió ${pct}%`, monto: diff }
  }

  return (
    <div className="min-h-screen" style={{ background: '#08080f', color: 'white' }}>
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Mis favoritos</h1>
          <p className="text-sm text-gray-500">
            {favoritos.length > 0
              ? `${favoritos.length} producto${favoritos.length !== 1 ? 's' : ''} guardado${favoritos.length !== 1 ? 's' : ''}`
              : 'Guardá productos para seguir sus precios'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse flex gap-4"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-24 h-24 rounded-xl shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-2 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-4 rounded w-1/3 mt-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : favoritos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-5xl">♡</p>
            <p className="text-gray-400 text-lg font-medium">No tenés favoritos todavía</p>
            <p className="text-gray-600 text-sm">Guardá productos para seguir sus precios fácilmente</p>
            <button onClick={() => navigate('/productos')}
              className="mt-2 text-sm font-semibold px-6 py-3 rounded-xl transition hover:opacity-90"
              style={{ background: '#7c3aed', color: 'white' }}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map(fav => {
              const status = getPriceStatus(fav)
              const prod = fav.producto
              return (
                <div key={fav._id}
                  className="rounded-2xl border border-white/5 p-4 flex gap-4 transition hover:border-violet-500/30 group"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>

                  {/* Imagen */}
                  <div
                    onClick={() => navigate(`/producto/${prod._id}`)}
                    className="w-24 h-24 rounded-xl shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {prod.imagen
                      ? <img src={prod.imagen} alt={prod.nombre}
                          className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={e => e.target.style.display = 'none'} />
                      : <span className="text-2xl">📦</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-xs mb-1" style={{ color: '#a78bfa' }}>{prod.categoria}</p>
                    <p
                      onClick={() => navigate(`/producto/${prod._id}`)}
                      className="text-sm text-white font-medium leading-snug line-clamp-2 cursor-pointer hover:text-violet-300 transition mb-auto">
                      {prod.nombre}
                    </p>

                    <div className="mt-3">
                      <p className="text-base font-black text-white">
                        ${prod.precio?.toLocaleString('es-AR')}
                      </p>

                      {/* Estado del precio */}
                      {status && (
                        <div className={`flex items-center gap-1.5 mt-1 text-xs font-semibold ${
                          status.tipo === 'bajo' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <span>{status.tipo === 'bajo' ? '↓' : '↑'}</span>
                          <span>{status.label} desde que lo guardaste</span>
                        </div>
                      )}

                      {fav.precioAlAgregar && fav.precioAlAgregar !== prod.precio && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Antes: ${fav.precioAlAgregar?.toLocaleString('es-AR')}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">{prod.tienda}</span>
                        <span className="text-gray-800">·</span>
                        <button
                          onClick={() => handleRemove(prod._id)}
                          className="text-xs text-gray-600 hover:text-red-400 transition">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites