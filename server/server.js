import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'

import { connectDB } from './src/db.js'
import { seedAdmin } from './src/auth.js'
import authRoutes from './src/routes/auth.js'
import vendorRoutes from './src/routes/vendors.js'
import bookingRoutes from './src/routes/bookings.js'
import budgetRoutes from './src/routes/budget.js'
import aiRoutes from './src/routes/ai.js'
import adminRoutes from './src/routes/admin.js'
import uploadRoutes from './src/routes/uploads.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// Minimal hardening headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  next()
})

// CORS for dev (vite :3000), any configured client origin, and same-origin
// (backend + frontend on one Vercel domain need no configuration)
const origins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')
app.use((req, res, next) => {
  const origin = req.headers.origin
  const sameOrigin = (() => {
    try {
      return origin && new URL(origin).host === req.headers.host
    } catch {
      return false
    }
  })()
  if (origin && (origins.includes(origin.trim()) || sameOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
  }
  next()
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }))

const api = express.Router()
api.get('/health', async (req, res) => {
  const { mongoose } = await import('mongoose')
  res.json({
    status: 'healthy',
    service: 'vidai-backend',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})
api.use('/auth', authRoutes)
api.use('/vendors', vendorRoutes)
api.use('/bookings', bookingRoutes)
api.use('/budget', budgetRoutes)
api.use('/ai', aiRoutes) // /ai/chat, /ai/recommendations, /ai/invitations/generate
api.use('/admin', adminRoutes)
api.use('/upload', uploadRoutes)
app.use('/api/v1', api)

app.use((req, res) => res.status(404).json({ message: 'Not found' }))

app.use((err, req, res, _next) => {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  if (err.body) return res.status(status).json(err.body) // pass-through AI service responses
  res.status(status).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000

if (process.env.VERCEL) {
  // Serverless: Vercel owns the HTTP listener; we only need DB + app handler.
  connectDB()
    .then(() => seedAdmin())
    .catch((err) => console.error('Failed to connect to MongoDB:', err.message))
} else {
  connectDB()
    .then(async () => {
      await seedAdmin()
      app.listen(PORT, () =>
        console.log(
          `VidAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        )
      )
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message)
      process.exit(1)
    })
}

export default app
