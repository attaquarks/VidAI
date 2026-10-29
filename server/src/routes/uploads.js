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
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

// Production: CLOUDINARY_URL set → images upload to Cloudinary (ephemeral
// hosting filesystems lose local files between restarts). Dev: local disk.
const useCloudinary = Boolean(process.env.CLOUDINARY_URL)
let cloudinary = null
if (useCloudinary) {
  import('cloudinary').then(({ v2 }) => {
    v2.config(true) // reads CLOUDINARY_URL
    cloudinary = v2
  })
  console.log('Uploads will go to Cloudinary')
}

function fileFilter(_req, file, cb) {
  cb(null, ALLOWED.has(file.mimetype))
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ALLOWED.get(file.mimetype)}`),
})
const memoryStorage = multer.memoryStorage()
const upload = multer({
  storage: useCloudinary ? memoryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter,
})

function toCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'vidai', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

const router = Router()
router.use(requireAuth, requireRole('vendor'))

async function handle(files, res, next) {
  try {
    if (useCloudinary) {
      const uploaded = await Promise.all(files.map((f) => toCloudinary(f.buffer)))
      return res.status(201).json({ urls: uploaded.map((r) => r.secure_url) })
    }
    res.status(201).json({ urls: files.map((f) => `/uploads/${f.filename}`) })
  } catch (e) {
    next(httpError(500, 'Image upload failed'))
  }
}

router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(httpError(err instanceof multer.MulterError ? 400 : 500, err.message))
    if (!req.file) return next(httpError(400, 'Attach an image field'))
    res.status(201).json({ url: useCloudinary ? req.file.path : `/uploads/${req.file.filename}`, filename: req.file.originalname })
  })
})

router.post('/images', (req, res, next) => {
  upload.array('images', 6)(req, res, (err) => {
    if (err) return next(httpError(err instanceof multer.MulterError ? 400 : 500, err.message))
    if (!req.files?.length) return next(httpError(400, 'Attach an images field'))
    handle(req.files, res, next)
  })
})

export default router
