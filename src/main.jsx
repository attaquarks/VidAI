import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles.css'
import App from './App.jsx'
import { AuthProvider } from './auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Outfit, sans-serif', borderRadius: '10px', fontSize: '0.92rem' },
          success: { iconTheme: { primary: '#a92747', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
)
