import axios from 'axios'

const api = axios.create({
  baseURL: 'https://retailai-backend-0onv.onrender.com'
})

// Automatically attach the shop_id header to every request
api.interceptors.request.use(function (config) {
  const shopId = localStorage.getItem('shop_id')
  if (shopId) {
    config.headers['X-Shop-Id'] = shopId
  }
  return config
})

export default api
