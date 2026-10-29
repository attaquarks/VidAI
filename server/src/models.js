import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

// Must mirror ai-service/app/services/prompts.py VENDOR_CATEGORIES —
// the AI prompts are written against this exact list.
export const VENDOR_CATEGORIES = [
  'venue', 'photographer', 'videographer', 'caterer', 'decorator',
  'makeup_artist', 'mehndi_artist', 'dj_music', 'wedding_planner',
  'invitation_cards', 'bridal_wear', 'groom_wear', 'jewelry',
  'transport', 'florist', 'cake', 'other',
]

export const EVENT_TYPES = [
  'wedding', 'engagement', 'mehndi', 'baraat', 'walima',
  'nikkah', 'full_wedding', 'other',
]

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
    isApproved: { type: Boolean, default: false }, // vendors: admin approval gate
    banned: { type: Boolean, default: false },
    businessName: String,
    city: String,
    phone: String,
    description: String,
    avatarUrl: String,
    servicesOffered: [String], // vendor categories this vendor covers
  },
  { timestamps: true }
)

// Field names must match ai-service's vendor reader exactly
const serviceSchema = new Schema(
  {
    vendor: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, enum: VENDOR_CATEGORIES, required: true },
    price: { type: Number, min: 0, default: 0 },
    priceUnit: { type: String, default: 'per event' },
    city: String,
    images: [String],
  },
  { timestamps: true }
)

const bookingSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    service: { type: Types.ObjectId, ref: 'Service', required: true },
    eventDate: { type: Date, required: true },
    eventType: { type: String, enum: EVENT_TYPES, default: 'wedding' },
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

const budgetSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    totalBudget: { type: Number, min: 0, default: 0 },
    eventType: { type: String, enum: EVENT_TYPES, default: 'full_wedding' },
    preferences: { type: Schema.Types.Mixed, default: {} },
    items: [
      {
        category: String,
        name: String,
        amount: { type: Number, min: 0, default: 0 },
        booked: { type: Boolean, default: false },
      },
    ],
    aiPlan: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

const activityLogSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User' },
    userName: String,
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

const passwordResetSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
})

export const User = model('User', userSchema)
export const Service = model('Service', serviceSchema)
export const Booking = model('Booking', bookingSchema)
export const Budget = model('Budget', budgetSchema)
export const ActivityLog = model('ActivityLog', activityLogSchema)
export const PasswordReset = model('PasswordReset', passwordResetSchema)

export async function logActivity(user, action, meta = {}) {
  try {
    await ActivityLog.create({
      user: user?._id,
      userName: user?.name || user?.email || 'anonymous',
      action,
      meta,
    })
  } catch {
    // activity logging must never break the request
  }
}
