import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

// Emulator reaches the host machine at 10.0.2.2; override via app.json extra.apiUrl
export const API_BASE = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:5000/api/v1'

const TOKEN_KEY = 'vidai_token'

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const setToken = (t) => SecureStore.setItemAsync(TOKEN_KEY, t)
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY)

export async function api(path, { method = 'GET', body, token, auth = true } = {}) {
  let bearer = token
  if (auth && !bearer) bearer = await getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(bearer && { Authorization: `Bearer ${bearer}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || data.detail || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const errMessage = (e) => e?.message || 'Something went wrong'
