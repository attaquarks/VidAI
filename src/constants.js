// Must mirror ai-service/app/services/prompts.py and server/src/models.js
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

export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Hyderabad', 'Gujranwala', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Mardan',
]

export const CATEGORY_LABELS = {
  venue: 'Venue', photographer: 'Photographer', videographer: 'Videographer',
  caterer: 'Caterer', decorator: 'Decorator', makeup_artist: 'Makeup Artist',
  mehndi_artist: 'Mehndi Artist', dj_music: 'DJ / Music', wedding_planner: 'Wedding Planner',
  invitation_cards: 'Invitation Cards', bridal_wear: 'Bridal Wear', groom_wear: 'Groom Wear',
  jewelry: 'Jewelry', transport: 'Transport', florist: 'Florist', cake: 'Cake', other: 'Other',
}

export const fmtPKR = (n) =>
  `₨${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const categoryLabel = (c) => CATEGORY_LABELS[c] || c?.replace(/_/g, ' ') || ''
