import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/useAuth'
import { addFavorite, removeFavorite, getFavorites } from '../services/productService'

const API = 'http://localhost:3001/api'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [esFavorito, setEsFavorito] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(`${API}/products/${id}`)
        setProducto(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducto()
  }, [id])

  useEffect(() => {
    if (!usuario || !producto) return
    getFavorites(usuario.token)
      .then(favs => setEsFavorito(favs.some(f => f.producto._id === producto._id)))
      .catch(console.error)
  }, [usuario, producto])

  const handleFavorito = async () => {
    if (!usuario) return navigate('/login')
    setLoadingFav(true)
    try {
      if (esFavorito) {
        await removeFavorite(producto._id, usuario.token)
        setEsFavorito(false)
      } else {
        await addFavorite(producto._id, producto.precio, usuario.token)
        setEsFavorito(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFav(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#08080f' }}>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="rounded-2xl h-96" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="flex flex-col gap-4">
            <div className="h-3 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-6 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-6 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-10 rounded w-1/3 mt-4" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      </div>
    </div>
  )

  if (!producto) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-400 mb-4">Producto no encontrado</p>
        <button onClick={() => navigate('/productos')}
          className="text-sm text-violet-400 hover:text-violet-300 transition">
          ← Volver a productos
        </button>
      </div>
    </div>
  )

  const ahorro = producto.precioAnterior
    ? producto.precioAnterior - producto.precio
    : null

  return (
    <div className="min-h-screen" style={{ background: '#08080f', color: 'white' }}>
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gray-400 transition">Inicio</button>
          <span>/</span>
          <button onClick={() => navigate('/productos')} className="hover:text-gray-400 transition">Productos</button>
          <span>/</span>
          <button onClick={() => navigate(`/productos?categoria=${encodeURIComponent(producto.categoria)}`)}
            className="hover:text-gray-400 transition">
            {producto.categoria}
          </button>
          <span>/</span>
          <span className="text-gray-500 truncate max-w-xs">{producto.nombre}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Imagen */}
          <div className="rounded-2xl border border-white/5 flex items-center justify-center p-8 relative"
            style={{ background: 'rgba(255,255,255,0.03)', minHeight: '400px' }}>
            {producto.descuento > 0 && (
              <div className="absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                -{producto.descuento}% OFF
              </div>
            )}
            {producto.imagen ? (
              <img src={producto.imagen} alt={producto.nombre}
                className="max-h-80 object-contain" />
            ) : (
              <p className="text-gray-700 text-5xl">📦</p>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">

            {/* Badge tienda + categoría */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-gray-400">
                {producto.tienda}
              </span>
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                {producto.categoria}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white leading-snug mb-6">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="rounded-2xl border border-white/5 p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              {producto.precioAnterior && (
                <p className="text-sm text-gray-600 line-through mb-1">
                  ${producto.precioAnterior?.toLocaleString('es-AR')}
                </p>
              )}
              <p className="text-3xl font-black text-white mb-1">
                ${producto.precio?.toLocaleString('es-AR')}
              </p>
              {ahorro && (
                <p className="text-sm font-semibold" style={{ color: '#34d399' }}>
                  Ahorrás ${ahorro.toLocaleString('es-AR')}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${producto.stock ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${producto.stock ? 'text-emerald-400' : 'text-red-400'}`}>
                {producto.stock ? 'En stock' : 'Sin stock'}
              </span>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3">
              {producto.url ? (
                <a href={producto.url} target="_blank" rel="noopener noreferrer"
                  className="w-full text-center py-3.5 rounded-xl font-bold text-white transition hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  Ver en {producto.tienda} →
                </a>
              ) : (
                <button disabled
                  className="w-full py-3.5 rounded-xl font-bold text-gray-500 border border-white/10 cursor-not-allowed">
                  URL no disponible
                </button>
              )}

              <button
                onClick={handleFavorito}
                disabled={loadingFav}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition border ${
                  esFavorito
                    ? 'border-red-800 text-red-400 hover:bg-red-900/20'
                    : 'border-white/10 text-gray-400 hover:border-violet-500 hover:text-violet-400'
                }`}>
                {loadingFav ? '...' : esFavorito ? '♥ Guardado en favoritos' : '♡ Agregar a favoritos'}
              </button>
            </div>

            {/* Specs si existen */}
            {producto.specs && Object.keys(producto.specs).length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Especificaciones
                </p>
                <div className="rounded-2xl border border-white/5 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {Object.entries(producto.specs).map(([key, val], i) => (
                    <div key={key}
                      className={`flex items-start px-4 py-3 text-sm gap-4 ${
                        i % 2 === 0 ? '' : ''
                      } border-b border-white/5 last:border-0`}>
                      <span className="text-gray-500 shrink-0 w-36">{key}</span>
                      <span className="text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetail