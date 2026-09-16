import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000'
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