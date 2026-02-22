import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

export const getProducts = async (filtros = {}) => {
  const params = new URLSearchParams()
  
  if (filtros.categoria) params.append('categoria', filtros.categoria)
  if (filtros.tienda) params.append('tienda', filtros.tienda)
  if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
  if (filtros.precioMin) params.append('precioMin', filtros.precioMin)
  if (filtros.precioMax) params.append('precioMax', filtros.precioMax)
  if (filtros.orden) params.append('orden', filtros.orden)
  if (filtros.page) params.append('page', filtros.page)

  const res = await axios.get(`${API_URL}/products?${params}`)
  return res.data
}

export const getCategorias = async () => {
  const res = await axios.get(`${API_URL}/products/categorias`)
  return res.data
}

export const getFavorites = async (token) => {
  const res = await axios.get(`${API_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const addFavorite = async (productoId, precioActual, token) => {
  const res = await axios.post(`${API_URL}/favorites`,
    { productoId, precioActual },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export const removeFavorite = async (productoId, token) => {
  const res = await axios.delete(`${API_URL}/favorites/${productoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}