import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/useAuth'
import { addFavorite, removeFavorite, getFavorites } from '../services/productService'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()                              // ← faltaba
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [esFavorito, setEsFavorito] = useState(false)        // ← faltaba
  const [loadingFav, setLoadingFav] = useState(false)

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/products/${id}`)
        setProducto(res.data)
      } catch (error) {
        console.error('Error al cargar producto:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducto()
  }, [id])

  useEffect(() => {
  const verificarFavorito = async () => {
    if (!usuario || !producto) return
    try {
      const favoritos = await getFavorites(usuario.token)
      const existe = favoritos.some(f => f.producto._id === producto._id)
      setEsFavorito(existe)
    } catch (error) {
      console.error(error)
    }
  }
  verificarFavorito()
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
  } catch (error) {
    console.error(error)
  } finally {
    setLoadingFav(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Cargando producto...</p>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Producto no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-cyan-400 tracking-tight cursor-pointer"
        >
          DemTech
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Volver
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Imagen */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center p-8 h-80">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="max-h-full object-contain"
              onError={e => e.target.style.display = 'none'}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
              {producto.categoria}
            </p>
            <h2 className="text-xl font-bold text-white leading-snug">
              {producto.nombre}
            </h2>
            <p className="text-3xl font-bold text-white">
              ${producto.precio?.toLocaleString('es-AR')}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                {producto.tienda}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${producto.stock ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                {producto.stock ? 'En stock' : 'Sin stock'}
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <a
                    href={producto.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-center py-3 rounded-xl transition"
                >
                Comprar en {producto.tienda} →
              </a>
              <button
                onClick={handleFavorito}
                disabled={loadingFav}
                className={`font-medium py-3 rounded-xl transition border ${esFavorito? 'border-cyan-500 text-cyan-400 hover:border-red-500 hover:text-red-400':'border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400'}`}>
                {loadingFav ? 'Guardando...' : esFavorito ? '♥ En favoritos' : '♡ Agregar a favoritos'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Última actualización: {new Date(producto.ultimaActualizacion).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>

        {/* Specs si existen */}
        {producto.specs && Object.keys(producto.specs).length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-4">Especificaciones técnicas</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {Object.entries(producto.specs).map(([clave, valor], i) => (
                <div
                  key={clave}
                  className={`flex px-6 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}`}
                >
                  <span className="text-gray-400 w-1/2 capitalize">{clave.replace(/_/g, ' ')}</span>
                  <span className="text-white w-1/2">{valor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProductDetail