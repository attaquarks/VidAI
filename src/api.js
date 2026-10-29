import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const TOKEN_KEY = 'vidai_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Uploaded images live on the backend origin (dev: vite proxies /uploads)
const assetOrigin = (() => {
  if (API_URL.startsWith('http')) return new URL(API_URL).origin
  return ''
})()
export const assetUrl = (path) => (path?.startsWith('/uploads') ? `${assetOrigin}${path}` : path)

const api = axios.create({ baseURL: API_URL, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error
    const isRefreshCall = config?.url?.includes('/auth/refresh-token')
    if (response?.status === 401 && !isRefreshCall && !config._retried) {
      config._retried = true
      try {
        refreshing ||= api.post('/auth/refresh-token').finally(() => (refreshing = null))
        const { data } = await refreshing
        setToken(data.accessToken)
        config.headers.Authorization = `Bearer ${data.accessToken}`
        return api(config)
      } catch {
        clearToken()
      }
    }
    return Promise.reject(error)
  }
)

export const errMessage = (e) =>
  e?.response?.data?.message || e?.response?.data?.detail || e.message || 'Something went wrong'

export default api
