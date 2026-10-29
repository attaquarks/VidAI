import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/PublicLayout.jsx'
import Shell from './components/Shell.jsx'
import RequireRole from './components/Guards.jsx'
import { useAuth } from './auth.jsx'
import { userNav, vendorNav, adminNav, homeFor } from './nav.js'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VendorLanding from './pages/VendorLanding.jsx'
import VendorPublicProfile from './pages/VendorPublicProfile.jsx'

import UserDashboard from './pages/user/Dashboard.jsx'
import UserBudget from './pages/user/Budget.jsx'
import UserChat from './pages/user/Chat.jsx'
import UserVendors from './pages/user/Vendors.jsx'
import UserInvitations from './pages/user/Invitations.jsx'
import UserBookings from './pages/user/Bookings.jsx'

import VendorProfile from './pages/vendor/Profile.jsx'
import VendorServices from './pages/vendor/Services.jsx'
import VendorBookings from './pages/vendor/Bookings.jsx'

import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminVendors from './pages/admin/Vendors.jsx'
import AdminLogs from './pages/admin/Logs.jsx'
import AdminSystem from './pages/admin/System.jsx'

function Landing() {
  const { user, booting } = useAuth()
  if (booting) return null
  if (user) return <Navigate to={homeFor(user.role)} replace />
  return <Home />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/vendor-landing" element={<VendorLanding />} />
        <Route path="/vendors/:id" element={<VendorPublicProfile />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<RequireRole role="user" />}>
        <Route element={<Shell nav={userNav} areaLabel="Plan your wedding" />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/budget" element={<UserBudget />} />
          <Route path="/user/chat" element={<UserChat />} />
          <Route path="/user/vendors" element={<UserVendors />} />
          <Route path="/user/invitations" element={<UserInvitations />} />
          <Route path="/user/bookings" element={<UserBookings />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="vendor" />}>
        <Route element={<Shell nav={vendorNav} areaLabel="Vendor portal" />}>
          <Route path="/vendor" element={<VendorBookings />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
          <Route path="/vendor/services" element={<VendorServices />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="admin" />}>
        <Route element={<Shell nav={adminNav} areaLabel="Platform administration" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/vendors" element={<AdminVendors />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/system-health" element={<AdminSystem />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
