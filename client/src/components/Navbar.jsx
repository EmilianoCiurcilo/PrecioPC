import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logoPPC from '../assets/ppc_logo.png'

function Navbar({ onBusqueda, busqueda }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="shrink-0">
            <img src={logoPPC} alt="PrecioPC" className="h-8 object-contain" />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Inicio', to: '/' },
            { label: 'Productos', to: '/productos' },
            { label: 'Contacto', to: '/contacto' },
          ].map(link => (
            <Link key={link.to} to={link.to}
              className="text-sm px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Buscador */}
        {onBusqueda && (
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda || ''}
              onChange={e => onBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-violet-500 transition"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
          </div>
        )}

        {/* Auth */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {usuario ? (
            <>
              <Link to="/favoritos"
                className="text-sm text-gray-400 hover:text-violet-400 transition">
                ♡ Favoritos
              </Link>
              <Link to="/perfil"
                className="text-sm text-gray-400 hover:text-white transition">
                {usuario.nombre}
              </Link>
              <button onClick={() => { logout(); navigate('/') }}
                className="text-xs text-gray-600 hover:text-gray-400 transition">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-sm text-gray-400 hover:text-white transition">
                Iniciar sesión
              </Link>
              <Link to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition"
                style={{ background: '#7c3aed', color: 'white' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar