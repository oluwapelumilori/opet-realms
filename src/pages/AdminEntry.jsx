
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminDashboard from './AdminDashboard'
import StaffDashboard from './StaffDashboard'

export default function AdminEntry() {
  const location = useLocation()
  const [destination, setDestination] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function verifyAccess() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          if (!cancelled) {
            setDestination('login')
          }
          return
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('staff_profiles')
          .select('id, role, is_active')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          throw profileError
        }

        if (
          !profile ||
          profile.is_active !== true ||
          !['admin', 'staff'].includes(profile.role)
        ) {
          await supabase.auth.signOut()

          if (!cancelled) {
            setDestination('login')
          }
          return
        }

        if (!cancelled) {
          setDestination(profile.role)
        }
      } catch (error) {
        console.error('Dashboard access verification failed:', error)

        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('Unable to clear invalid session:', signOutError)
        }

        if (!cancelled) {
          setDestination('login')
        }
      }
    }

    verifyAccess()

    return () => {
      cancelled = true
    }
  }, [])

  if (destination === 'checking') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f7faf8',
          color: '#087f5b',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LoaderCircle
            size={32}
            style={{
              animation: 'opet-spin 1s linear infinite',
            }}
          />
          <p>Verifying your account...</p>
        </div>

        <style>
          {`
            @keyframes opet-spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </main>
    )
  }

  if (destination === 'login') {
    return <Navigate to="/admin/login" replace />
  }

  if (destination === 'admin') {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />
    }

    return <AdminDashboard />
  }

  if (destination === 'staff') {
    if (location.pathname !== '/staff') {
      return <Navigate to="/staff" replace />
    }

    return <StaffDashboard />
  }

  return <Navigate to="/admin/login" replace />
}
