import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { Router } from 'express'
import multer from 'multer'
import { fileURLToPath } from 'node:url'
import { requireAuth, requireRole, httpError } from '../auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype)
    cb(null, ext ? `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}` : new Error('Unsupported image type'))
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.has(file.mimetype)),
})

const router = Router()
router.use(requireAuth, requireRole('vendor'))

const url = (f) => ({ url: `/uploads/${f.filename}`, filename: f.filename })

router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(httpError(err instanceof multer.MulterError ? 400 : 500, err.message))
    if (!req.file) return next(httpError(400, 'Attach an image field'))
    res.status(201).json(url(req.file))
  })
})

router.post('/images', (req, res, next) => {
  upload.array('images', 6)(req, res, (err) => {
    if (err) return next(httpError(err instanceof multer.MulterError ? 400 : 500, err.message))
    if (!req.files?.length) return next(httpError(400, 'Attach an images field'))
    res.status(201).json({ urls: req.files.map((f) => `/uploads/${f.filename}`) })
  })
})

export default router
