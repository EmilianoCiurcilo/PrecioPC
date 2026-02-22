import { useState, useEffect } from 'react'
import { getProducts, getCategorias } from '../services/productService'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'


function Home() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    precioMin: '',
    precioMax: '',
    orden: '',
    page: 1
  })

const navigate = useNavigate()
const { usuario, logout } = useAuth()

  useEffect(() => {
    getCategorias().then(setCategorias)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const data = await getProducts(filtros)
        setProductos(data.productos)
        setTotal(data.total)
      } catch (error) {
        console.error('Error al cargar productos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [filtros])

  const handleFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">DemTech</h1>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={filtros.busqueda}
          onChange={e => handleFiltro('busqueda', e.target.value)}
          className="bg-gray-800 text-white placeholder-gray-500 rounded-lg px-4 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        />
        <div className="flex gap-3 items-center">
  {usuario ? (
    <>
      <span className="text-sm text-gray-400">Hola, {usuario.nombre}</span>
      <button
        onClick={logout}
        className="text-sm text-gray-400 hover:text-white transition"
      >
        Cerrar sesión
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">
        Iniciar sesión
      </Link>
      <Link to="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition">
        Registrarse
      </Link>
    </>
  )}
</div>
      </nav>

      <div className="flex">

        {/* Sidebar filtros */}
        <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 p-5 flex flex-col gap-6 sticky top-16 h-screen overflow-y-auto">
          
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Categoría</h2>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleFiltro('categoria', '')}
                className={`text-left text-sm px-3 py-2 rounded-lg transition ${filtros.categoria === '' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                Todas
              </button>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleFiltro('categoria', cat)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition ${filtros.categoria === cat ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Precio</h2>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={filtros.precioMin}
                onChange={e => handleFiltro('precioMin', e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={filtros.precioMax}
                onChange={e => handleFiltro('precioMax', e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ordenar</h2>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Más reciente', value: '' },
                { label: 'Menor precio', value: 'precio_asc' },
                { label: 'Mayor precio', value: 'precio_desc' },
                { label: 'Nombre A-Z', value: 'nombre_asc' },
              ].map(op => (
                <button
                  key={op.value}
                  onClick={() => handleFiltro('orden', op.value)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition ${filtros.orden === op.value ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">

          {/* Header resultados */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">{total.toLocaleString('es-AR')}</span> productos encontrados
            </p>
          </div>

          {/* Grid productos */}
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="bg-gray-900 rounded-xl p-4 animate-pulse">
        <div className="bg-gray-800 h-40 rounded-lg mb-3" />
        <div className="bg-gray-800 h-3 rounded mb-2" />
        <div className="bg-gray-800 h-3 rounded w-2/3 mb-3" />
        <div className="bg-gray-800 h-5 rounded w-1/2" />
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {productos.map(producto => (
      <div
        key={producto._id}
        onClick={() => navigate(`/producto/${producto._id}`)}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col hover:border-cyan-500 transition cursor-pointer group"
      >
        <div className="bg-gray-800 rounded-lg mb-3 flex items-center justify-center h-40 overflow-hidden">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-full object-contain group-hover:scale-105 transition"
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <p className="text-xs text-cyan-400 font-medium mb-1">{producto.categoria}</p>
        <p className="text-sm text-white font-medium leading-snug mb-3 flex-1 line-clamp-3">
          {producto.nombre}
        </p>
        <div className="mt-auto">
          <p className="text-lg font-bold text-white">
            ${producto.precio?.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{producto.tienda}</p>
        </div>
      </div>
    ))}
  </div>
)}

          {/* Paginación */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              disabled={filtros.page === 1}
              onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
            >
              ← Anterior
            </button>
            <span className="text-gray-400 text-sm">Página {filtros.page}</span>
            <button
              onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
            >
              Siguiente →
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Home