
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  FileText,
  Users,
  LogOut,
  LayoutDashboard,
  LoaderCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [staffName, setStaffName] = useState('Admin')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function verifyAccess() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError) throw sessionError

        const user = data.session?.user

        if (!user) {
          navigate('/admin/login', { replace: true })
          return
        }

        const { data: profile, error: profileError } =
          await supabase
            .from('staff_profiles')
            .select('full_name, role, is_active')
            .eq('id', user.id)
            .single()

        if (
          profileError ||
          !profile ||
          !profile.is_active
        ) {
          await supabase.auth.signOut()
          navigate('/admin/login', { replace: true })
          return
        }

        if (active) {
          setStaffName(profile.full_name || 'Admin')
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Unable to verify your admin access.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    verifyAccess()

    return () => {
      active = false
    }
  }, [navigate])

  async function handleSignOut() {
    const { error: signOutError } =
      await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
      return
    }

    navigate('/admin/login', { replace: true })
  }

  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <LoaderCircle size={24} />
          <p>Checking admin access...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-panel">
          <h1>Unable to load dashboard</h1>
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
          >
            Return to login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <a href="/" className="admin-dashboard-brand">
          Opet <span>Realms</span>
        </a>

        <button
          type="button"
          className="admin-dashboard-signout"
          onClick={handleSignOut}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-welcome">
          <div>
            <p className="admin-dashboard-eyebrow">
              <LayoutDashboard size={16} />
              ADMIN PORTAL
            </p>
            <h1>Welcome, {staffName}</h1>
            <p>
              Manage your cleaning services business from
              one place.
            </p>
          </div>
        </div>

        <div className="admin-dashboard-cards">
          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <CalendarDays size={22} />
            </span>
            <h2>Bookings</h2>
            <p>
              Booking records will appear here when the
              bookings data source is connected.
            </p>
          </article>

          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <FileText size={22} />
            </span>
            <h2>Invoices</h2>
            <p>
              Invoice records will appear here when the
              invoices data source is connected.
            </p>
          </article>

          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <Users size={22} />
            </span>
            <h2>Team</h2>
            <p>
              Your staff access is verified through
              Supabase.
            </p>
          </article>
        </div>

        <section className="admin-dashboard-panel">
          <h2>Dashboard setup</h2>
          <p>
            Your admin page is now in place. The next step
            is connecting the correct Supabase tables so
            real bookings and invoices can be displayed.
          </p>
        </section>
      </section>
    </main>
  )
}
