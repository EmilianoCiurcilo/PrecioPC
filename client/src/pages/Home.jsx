import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

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

function ProductCard({ producto, onClick }) {
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl border border-white/5 p-4 flex flex-col transition-all duration-200 hover:border-violet-500/50 hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="rounded-xl mb-3 flex items-center justify-center h-44 overflow-hidden"
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
        <div className="flex items-center gap-2">
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
        <p className="text-xs text-gray-600 mt-1">{producto.tienda}</p>
      </div>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [descuentos, setDescuentos] = useState([])
  const [masBuscados, setMasBuscados] = useState([])
  const [loading, setLoading] = useState(true)
  const catScrollRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, desc, buscados] = await Promise.all([
          axios.get(`${API}/products/categorias-agrupadas`),
          axios.get(`${API}/products/descuentos`),
          axios.get(`${API}/products/mas-buscados`),
        ])
        setCategorias(cats.data)
        setDescuentos(desc.data)
        setMasBuscados(buscados.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const scrollCats = (dir) => {
    catScrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  const irACategoria = (cat) => {
    navigate(`/productos?categoria=${encodeURIComponent(cat.nombre)}`)
  }

  return (
    <div className="min-h-screen" style={{ background: '#08080f', color: 'white' }}>
      <Navbar />

      {/* Banner placeholder */}
      <div className="max-w-screen-xl mx-auto px-6 pt-8">
        <div className="rounded-2xl h-48 flex items-center justify-center border border-white/5 mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(16,185,129,0.1) 100%)' }}>
          <div className="text-center">
            <p className="text-2xl font-black text-white mb-1">🔥 Hot Sale — Hasta 40% OFF</p>
            <p className="text-gray-400 text-sm">Los mejores precios de Argentina en un solo lugar</p>
          </div>
        </div>

        {/* Categorías */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Categorías</h2>
            <div className="flex gap-2">
              <button onClick={() => scrollCats(-1)}
                className="w-8 h-8 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-violet-500 transition flex items-center justify-center text-sm">
                ←
              </button>
              <button onClick={() => scrollCats(1)}
                className="w-8 h-8 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-violet-500 transition flex items-center justify-center text-sm">
                →
              </button>
            </div>
          </div>

          <div ref={catScrollRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}>
            {categorias.map(cat => (
              <button key={cat.nombre} onClick={() => irACategoria(cat)}
                className="shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border border-white/5 hover:border-violet-500/50 transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: 'rgba(255,255,255,0.03)', minWidth: '100px' }}>
                <span className="text-2xl">{CATEGORY_ICONS[cat.nombre] || '📦'}</span>
                <span className="text-xs text-gray-400 group-hover:text-white transition text-center leading-tight">
                  {cat.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Descuentos de la semana */}
        {descuentos.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">🔥 Descuentos de la semana</h2>
                <p className="text-xs text-gray-500 mt-0.5">Los mejores precios de hoy</p>
              </div>
              <button onClick={() => navigate('/productos?orden=descuento')}
                className="text-xs text-violet-400 hover:text-violet-300 transition">
                Ver todos →
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="h-44 rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="h-2 rounded mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="h-4 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {descuentos.map(p => (
                  <ProductCard key={p._id} producto={p}
                    onClick={() => navigate(`/producto/${p._id}`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Más buscados */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">⭐ Más buscados</h2>
              <p className="text-xs text-gray-500 mt-0.5">Los favoritos de la comunidad</p>
            </div>
            <button onClick={() => navigate('/productos')}
              className="text-xs text-violet-400 hover:text-violet-300 transition">
              Ver todos →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="h-44 rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-2 rounded mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-4 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {masBuscados.map(p => (
                <ProductCard key={p._id} producto={p}
                  onClick={() => navigate(`/producto/${p._id}`)} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Home