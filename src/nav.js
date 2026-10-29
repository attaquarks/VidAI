import {
  LayoutDashboard, Wallet, MessageCircleHeart, Store, MailOpen, CalendarCheck,
  UserCog, Package, ClipboardList, Users, ScrollText, Activity,
} from 'lucide-react'

export const userNav = [
  { to: '/user', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/user/budget', label: 'Budget', icon: Wallet },
  { to: '/user/chat', label: 'AI Assistant', icon: MessageCircleHeart },
  { to: '/user/vendors', label: 'Find Vendors', icon: Store },
  { to: '/user/invitations', label: 'Invitations', icon: MailOpen },
  { to: '/user/bookings', label: 'My Bookings', icon: CalendarCheck },
]

export const vendorNav = [
  { to: '/vendor', label: 'Bookings', icon: ClipboardList, end: true },
  { to: '/vendor/services', label: 'My Packages', icon: Package },
  { to: '/vendor/profile', label: 'Business Profile', icon: UserCog },
]

export const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/logs', label: 'Activity Logs', icon: ScrollText },
  { to: '/admin/system-health', label: 'System Health', icon: Activity },
]

export function homeFor(role) {
  return { user: '/user', vendor: '/vendor', admin: '/admin' }[role] || '/'
}
