import { Router } from 'express'
import { requireAuth } from '../auth.js'
import { proxyAI } from '../proxy.js'

// Thin authenticated proxies to the Python AI service
const router = Router()
router.use(requireAuth)

router.post('/chat', async (req, res, next) => {
  try {
    res.json(await proxyAI('/api/v1/chat', {
      message: req.body?.message,
      conversationHistory: req.body?.conversationHistory || [],
      userId: req.user._id.toString(),
    }, 330_000))
  } catch (e) {
    next(e)
  }
})

router.post('/recommendations', async (req, res, next) => {
  try {
    res.json(await proxyAI('/api/v1/recommendations', {
      preferences: req.body?.preferences || {},
      budget: Number(req.body?.budget) || 0,
      city: req.body?.city || '',
      category: req.body?.category || '',
      userId: req.user._id.toString(),
    }))
  } catch (e) {
    next(e)
  }
})

router.post('/invitations/generate', async (req, res, next) => {
  try {
    res.json(await proxyAI('/api/v1/invitations/generate', {
      essentials: req.body?.essentials || {},
      style: req.body?.style || {},
      tone: req.body?.tone || 'formal',
      userId: req.user._id.toString(),
    }))
  } catch (e) {
    next(e)
  }
})

export default router
