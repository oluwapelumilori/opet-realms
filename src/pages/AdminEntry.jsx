import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminDashboard from './AdminDashboard'

// One login for everyone. After signing in, admins see the full dashboard
// and active staff are sent to the staff dashboard.
export default function AdminEntry() {
  const [destination, setDestination] = useState('checking')

  useEffect(() => {
    let cancelled = false

    async function decide() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          if (!cancelled) setDestination('login')
          return
        }

        const { data: profile } = await supabase
          .from('staff_profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .maybeSingle()

        if (cancelled) return

        if (profile && profile.is_active && profile.role !== 'admin') {
          setDestination('staff')
        } else {
          // Admins, and anything unexpected, go to the admin dashboard,
          // which already signs out accounts that should not be there.
          setDestination('admin')
        }
      } catch (err) {
        console.error('Admin entry check failed:', err)
        if (!cancelled) setDestination('admin')
      }
    }

    decide()

    return () => {
      cancelled = true
    }
  }, [])

  if (destination === 'checking') {
    return (
      <main
        style={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
          color: '#087f5b',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LoaderCircle size={30} />
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (destination === 'login') {
    return <Navigate to="/admin/login" replace />
  }

  if (destination === 'staff') {
    return <Navigate to="/staff" replace />
  }

  return <AdminDashboard />
}
