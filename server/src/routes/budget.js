import { Router } from 'express'
import { requireAuth, requireRole, httpError } from '../auth.js'
import { Budget, logActivity } from '../models.js'
import { proxyAI } from '../proxy.js'

const router = Router()
router.use(requireAuth, requireRole('user'))

async function ownBudget(req) {
  let budget = await Budget.findOne({ user: req.user._id })
  if (!budget) budget = await Budget.create({ user: req.user._id })
  return budget
}

router.get('/me', async (req, res, next) => {
  try {
    res.json({ data: await ownBudget(req) })
  } catch (e) {
    next(e)
  }
})

router.put('/me', async (req, res, next) => {
  try {
    const { totalBudget, eventType, preferences } = req.body || {}
    const budget = await ownBudget(req)
    if (totalBudget !== undefined) budget.totalBudget = Math.max(0, Number(totalBudget) || 0)
    if (eventType !== undefined) budget.eventType = eventType
    if (preferences !== undefined) budget.preferences = preferences
    await budget.save()
    res.json({ data: budget })
  } catch (e) {
    next(e)
  }
})

router.post('/items', async (req, res, next) => {
  try {
    const { category, name, amount } = req.body || {}
    if (!name?.trim()) throw httpError(400, 'Item name is required')
    const budget = await ownBudget(req)
    budget.items.push({ category: category || 'other', name: name.trim(), amount: Number(amount) || 0 })
    await budget.save()
    res.status(201).json({ data: budget })
  } catch (e) {
    next(e)
  }
})

router.delete('/items/:itemId', async (req, res, next) => {
  try {
    const budget = await ownBudget(req)
    budget.items = budget.items.filter((i) => i._id.toString() !== req.params.itemId)
    await budget.save()
    res.json({ data: budget })
  } catch (e) {
    next(e)
  }
})

// Generate an AI plan for the stored budget and save it
router.post('/ai-plan', async (req, res, next) => {
  try {
    const budget = await ownBudget(req)
    const totalBudget = Number(req.body?.totalBudget) || budget.totalBudget
    if (!totalBudget || totalBudget <= 0) throw httpError(400, 'Set a total budget first')
    const eventType = req.body?.eventType || budget.eventType
    const preferences = { ...budget.preferences, ...(req.body?.preferences || {}) }

    const result = await proxyAI('/api/v1/budget-plan', {
      totalBudget, eventType, preferences, userId: req.user._id.toString(),
    })
    budget.totalBudget = totalBudget
    budget.eventType = eventType
    budget.aiPlan = result.data
    await budget.save()
    await logActivity(req.user, 'budget-ai-plan', { totalBudget })
    res.json({ data: budget })
  } catch (e) {
    next(e)
  }
})

export default router
