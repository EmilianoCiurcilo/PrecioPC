import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/useAuth'
import { addFavorite, removeFavorite, getFavorites } from '../services/productService'

const API = 'http://localhost:3001/api'

const CATEGORY_ICONS = {
  'Procesadores': '⚡',
  'Placas de Video': '🎮',
  'Motherboards': '🖥️',
  'Memorias RAM': '🧠',
  'Almacenamiento': '💾',
  'Fuentes': '🔌',
  'Gabinetes': '🗄️',
  'Refrigeración': '❄️',
  'Pantallas': '🖥',
  'Periféricos': '⌨️',
  'Notebooks': '💻',
  'PC Armadas': '🖥️',
  'Combos': '📦',
  'Sillas Gamer': '🪑',
  'Consolas de Videojuego': '🕹️',
  'Impresoras e Insumos': '🖨️',
  'Otros': '🔧',
}

function Products() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { usuario } = useAuth()

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState([])
  const [precioMaxDB, setPrecioMaxDB] = useState(10000000)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: searchParams.get('categoria') || '',
    marcasSeleccionadas: [],
    precioMin: 0,
    precioMax: 10000000,
    orden: searchParams.get('orden') || '',
    page: 1
  })

  // Cargar categorías y marcas
  useEffect(() => {
    const fetchMeta = async () => {
      const [cats, mars] = await Promise.all([
        axios.get(`${API}/products/categorias-agrupadas`),
        axios.get(`${API}/products/marcas`)
      ])
      setCategorias(cats.data)
      setMarcas(mars.data.filter(Boolean).sort())
    }
    fetchMeta()
  }, [])

  // Cargar favoritos
  useEffect(() => {
    if (!usuario) return
    getFavorites(usuario.token)
      .then(data => setFavoritos(data.map(f => f.producto._id)))
      .catch(console.error)
  }, [usuario])

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
        if (filtros.orden) params.append('orden', filtros.orden)
        params.append('page', filtros.page)
        params.append('limit', 24)

        let url
        if (filtros.categoria) {
          url = `${API}/products/categoria/${encodeURIComponent(filtros.categoria)}?${params}`
          if (filtros.precioMin > 0) params.append('precioMin', filtros.precioMin)
          if (filtros.precioMax < precioMaxDB) params.append('precioMax', filtros.precioMax)
          url = `${API}/products/categoria/${encodeURIComponent(filtros.categoria)}?${params}`
        } else {
          if (filtros.precioMin > 0) params.append('precioMin', filtros.precioMin)
          if (filtros.precioMax < precioMaxDB) params.append('precioMax', filtros.precioMax)
          if (filtros.marcasSeleccionadas.length > 0) {
            filtros.marcasSeleccionadas.forEach(m => params.append('marca', m))
          }
          url = `${API}/products?${params}`
        }

        const res = await axios.get(url)
        setProductos(res.data.productos)
        setTotal(res.data.total)

        // Calcular precio máximo real de la categoría
        if (res.data.productos.length > 0) {
          const maxPrecio = Math.max(...res.data.productos.map(p => p.precio))
          setPrecioMaxDB(Math.ceil(maxPrecio / 100000) * 100000)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [filtros])

  const handleFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor, page: 1 }))
  }

  const toggleMarca = (marca) => {
    setFiltros(prev => ({
      ...prev,
      marcasSeleccionadas: prev.marcasSeleccionadas.includes(marca)
        ? prev.marcasSeleccionadas.filter(m => m !== marca)
        : [...prev.marcasSeleccionadas, marca],
      page: 1
    }))
  }

  const handleFavorito = async (e, producto) => {
    e.stopPropagation()
    if (!usuario) return navigate('/login')
    try {
      if (favoritos.includes(producto._id)) {
        await removeFavorite(producto._id, usuario.token)
        setFavoritos(prev => prev.filter(id => id !== producto._id))
      } else {
        await addFavorite(producto._id, producto.precio, usuario.token)
        setFavoritos(prev => [...prev, producto._id])
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#08080f', color: 'white' }}>
      <Navbar
        onBusqueda={(val) => handleFiltro('busqueda', val)}
        busqueda={filtros.busqueda}
      />

      {/* Chips de categorías */}
      <div className="border-b border-white/5 sticky top-14 z-40"
        style={{ background: 'rgba(8,8,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => handleFiltro('categoria', '')}
            className={`shrink-0 text-xs px-4 py-1.5 rounded-full border transition font-medium ${
              filtros.categoria === ''
                ? 'border-violet-500 text-white'
                : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
            style={filtros.categoria === '' ? { background: 'rgba(124,58,237,0.2)' } : {}}>
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.nombre}
              onClick={() => handleFiltro('categoria', cat.nombre)}
              className={`shrink-0 text-xs px-4 py-1.5 rounded-full border transition font-medium flex items-center gap-1.5 ${
                filtros.categoria === cat.nombre
                  ? 'border-violet-500 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
              }`}
              style={filtros.categoria === cat.nombre ? { background: 'rgba(124,58,237,0.2)' } : {}}>
              <span>{CATEGORY_ICONS[cat.nombre] || '📦'}</span>
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 flex gap-6">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 sticky top-28 h-fit flex flex-col gap-6">

          {/* Ordenar */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Ordenar</p>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Más reciente', value: '' },
                { label: 'Menor precio', value: 'precio_asc' },
                { label: 'Mayor precio', value: 'precio_desc' },
                { label: 'Mayor descuento', value: 'descuento' },
                { label: 'Nombre A-Z', value: 'nombre_asc' },
              ].map(op => (
                <button key={op.value}
                  onClick={() => handleFiltro('orden', op.value)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition text-left ${
                    filtros.orden === op.value
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={filtros.orden === op.value ? { background: 'rgba(124,58,237,0.2)', color: '#a78bfa' } : {}}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    filtros.orden === op.value ? 'bg-violet-400' : 'bg-gray-700'
                  }`} />
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de precio */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Precio</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>${(filtros.precioMin / 1000).toFixed(0)}k</span>
                <span>${(filtros.precioMax / 1000).toFixed(0)}k</span>
              </div>
              <input type="range"
                min={0} max={precioMaxDB}
                step={10000}
                value={filtros.precioMax}
                onChange={e => handleFiltro('precioMax', Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex gap-2">
                <input type="number"
                  placeholder="Min"
                  value={filtros.precioMin || ''}
                  onChange={e => handleFiltro('precioMin', Number(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
                <input type="number"
                  placeholder="Max"
                  value={filtros.precioMax || ''}
                  onChange={e => handleFiltro('precioMax', Number(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>
          </div>

          {/* Marcas */}
          {marcas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Marcas</p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                {marcas.slice(0, 20).map(marca => (
                  <label key={marca}
                    className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition">
                    <input type="checkbox"
                      checked={filtros.marcasSeleccionadas.includes(marca)}
                      onChange={() => toggleMarca(marca)}
                      className="accent-violet-500 w-3 h-3"
                    />
                    <span className={filtros.marcasSeleccionadas.includes(marca)
                      ? 'text-violet-400' : 'text-gray-400'}>
                      {marca}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          {(filtros.categoria || filtros.marcasSeleccionadas.length > 0 || filtros.precioMin > 0) && (
            <button
              onClick={() => setFiltros({
                busqueda: '',
                categoria: '',
                marcasSeleccionadas: [],
                precioMin: 0,
                precioMax: precioMaxDB,
                orden: '',
                page: 1
              })}
              className="text-xs text-gray-500 hover:text-red-400 transition text-left">
              ✕ Limpiar filtros
            </button>
          )}

        </aside>

        {/* Contenido */}
        <main className="flex-1">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              <span className="text-white font-semibold">{total.toLocaleString('es-AR')}</span> productos
              {filtros.categoria && <span className="text-violet-400"> en {filtros.categoria}</span>}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="h-44 rounded-xl mb-3"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-2 rounded mb-2"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-2 rounded w-2/3 mb-3"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-4 rounded w-1/2"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <p className="text-4xl">🔍</p>
              <p className="text-gray-400">No se encontraron productos</p>
              <button onClick={() => handleFiltro('categoria', '')}
                className="text-sm text-violet-400 hover:text-violet-300 transition">
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map(producto => (
                <div key={producto._id}
                  onClick={() => navigate(`/producto/${producto._id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/5 p-4 flex flex-col transition-all duration-200 hover:border-violet-500/50 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="rounded-xl mb-3 flex items-center justify-center h-40 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <img src={producto.imagen} alt={producto.nombre}
                      className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={e => e.target.style.display = 'none'} />
                  </div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#a78bfa' }}>
                    {producto.categoria}
                  </p>
                  <p className="text-sm text-white font-medium leading-snug mb-3 flex-1 line-clamp-2">
                    {producto.nombre}
                  </p>
                  <div className="mt-auto">
                    {producto.precioAnterior && (
                      <p className="text-xs text-gray-600 line-through">
                        ${producto.precioAnterior?.toLocaleString('es-AR')}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-white">
                        ${producto.precio?.toLocaleString('es-AR')}
                      </p>
                      {producto.descuento > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                          -{producto.descuento}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{producto.tienda}</p>
                    <button
                      onClick={(e) => handleFavorito(e, producto)}
                      className={`mt-2 w-full text-xs py-1.5 rounded-lg transition border ${
                        favoritos.includes(producto._id)
                          ? 'border-red-800 text-red-400'
                          : 'border-white/10 text-gray-500 hover:border-violet-500 hover:text-violet-400'
                      }`}>
                      {favoritos.includes(producto._id) ? '♥ En favoritos' : '♡ Favoritos'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {total > 24 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={filtros.page === 1}
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ← Anterior
              </button>
              <span className="text-gray-500 text-sm">
                Página {filtros.page} de {Math.ceil(total / 24)}
              </span>
              <button
                disabled={filtros.page >= Math.ceil(total / 24)}
                onClick={() => setFiltros(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 rounded-xl text-sm border border-white/10 text-gray-400 hover:text-white hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition">
                Siguiente →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Products