import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Favorites from './pages/Favorites'
import Products from './pages/Products'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App