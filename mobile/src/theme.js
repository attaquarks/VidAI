// VidAI design tokens — mirrors DESIGN.md (Marble & Rose Inlay)
export const colors = {
  marble: '#faf9f7',
  panel: '#ffffff',
  stone: '#f3efe9',
  stoneDeep: '#e8e1d6',
  rose: '#d7385e',
  roseDeep: '#a92747',
  roseInk: '#8e1f3b',
  roseSoft: '#f9e9ed',
  gold: '#b98a2f',
  goldDeep: '#8a6420',
  ink: '#1f2937',
  inkSoft: '#4b5563',
  muted: '#6b7280',
  line: '#e7e2d9',
  ok: '#15803d',
  okSoft: '#dcfce7',
  warn: '#b45309',
  warnSoft: '#fef3c7',
  bad: '#b91c1c',
  badSoft: '#fee2e2',
}

export const fmtPKR = (n) => `₨${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const CATEGORY_LABELS = {
  venue: 'Venue', photographer: 'Photographer', videographer: 'Videographer',
  caterer: 'Caterer', decorator: 'Decorator', makeup_artist: 'Makeup Artist',
  mehndi_artist: 'Mehndi Artist', dj_music: 'DJ / Music', wedding_planner: 'Wedding Planner',
  invitation_cards: 'Invitation Cards', bridal_wear: 'Bridal Wear', groom_wear: 'Groom Wear',
  jewelry: 'Jewelry', transport: 'Transport', florist: 'Florist', cake: 'Cake', other: 'Other',
}
export const categoryLabel = (c) => CATEGORY_LABELS[c] || (c || '').replace(/_/g, ' ') || ''

export const VENDOR_CATEGORIES = Object.keys(CATEGORY_LABELS)
export const EVENT_TYPES = ['wedding', 'engagement', 'mehndi', 'baraat', 'walima', 'nikkah', 'full_wedding', 'other']
export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Hyderabad', 'Gujranwala', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Mardan',
]
