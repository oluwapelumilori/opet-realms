import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  FileText,
  Users,
  LogOut,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [staffName, setStaffName] = useState('Admin')
  const [bookings, setBookings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [team, setTeam] = useState([])
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      const user = session?.user

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

      if (profileError) throw profileError

      if (
        !profile ||
        !profile.is_active ||
        profile.role !== 'admin'
      ) {
        await supabase.auth.signOut()
        navigate('/admin/login', { replace: true })
        return
      }

      setStaffName(profile.full_name || 'Admin')

      const [
        bookingsResult,
        invoicesResult,
        teamResult,
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select(
            'id, booking_ref, customer_name, phone, email, service, preferred_date, preferred_time, status, created_at'
          )
          .order('created_at', { ascending: false }),

        supabase
          .from('invoices')
          .select(
            'id, invoice_ref, customer_name, amount, status, issue_date, due_date'
          )
          .order('created_at', { ascending: false }),

        supabase
          .from('staff_profiles')
          .select('id, full_name, email, role, is_active')
          .order('created_at', { ascending: false }),
      ])

      if (bookingsResult.error) throw bookingsResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (teamResult.error) throw teamResult.error

      setBookings(bookingsResult.data || [])
      setInvoices(invoicesResult.data || [])
      setTeam(teamResult.data || [])
    } catch (err) {
      setError(
        err.message || 'Unable to load dashboard information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialise() {
      await loadDashboard()
    }

    initialise()

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    const { error: signOutError } =
      await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
      return
    }

    navigate('/admin/login', { replace: true })
  }

  function formatDate(value) {
    if (!value) return '—'

    return new Date(`${value}T00:00:00`).toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  function formatAmount(value) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)
  }

  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <LoaderCircle size={24} />
          <p>Loading admin dashboard...</p>
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

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="admin-dashboard-signout"
            onClick={loadDashboard}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="admin-dashboard-signout"
            onClick={handleSignOut}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
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

        {error && (
          <section className="admin-dashboard-panel">
            <p role="alert">{error}</p>
            <button type="button" onClick={loadDashboard}>
              Try again
            </button>
          </section>
        )}

        <div className="admin-dashboard-cards">
          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <CalendarDays size={22} />
            </span>
            <h2>Bookings</h2>
            <p>
              <strong>{bookings.length}</strong> booking records
            </p>
            <p>
              {bookings.filter((b) => b.status === 'new').length}{' '}
              new requests
            </p>
          </article>

          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <FileText size={22} />
            </span>
            <h2>Invoices</h2>
            <p>
              <strong>{invoices.length}</strong> invoice records
            </p>
            <p>
              {invoices.filter(
                (invoice) =>
                  String(invoice.status).toLowerCase() === 'unpaid'
              ).length}{' '}
              unpaid invoices
            </p>
          </article>

          <article className="admin-dashboard-card">
            <span className="admin-dashboard-card-icon">
              <Users size={22} />
            </span>
            <h2>Team</h2>
            <p>
              <strong>{team.length}</strong> staff profiles
            </p>
            <p>
              {team.filter((member) => member.is_active).length}{' '}
              active staff
            </p>
          </article>
        </div>

        <section className="admin-dashboard-panel">
          <h2>Recent bookings</h2>

          {bookings.length === 0 ? (
            <p>No bookings have been recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Reference</th>
                    <th align="left">Customer</th>
                    <th align="left">Service</th>
                    <th align="left">Date</th>
                    <th align="left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.booking_ref || '—'}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.service || '—'}</td>
                      <td>{formatDate(booking.preferred_date)}</td>
                      <td>{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-dashboard-panel">
          <h2>Recent invoices</h2>

          {invoices.length === 0 ? (
            <p>No invoices have been recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Reference</th>
                    <th align="left">Customer</th>
                    <th align="left">Amount</th>
                    <th align="left">Due date</th>
                    <th align="left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_ref || '—'}</td>
                      <td>{invoice.customer_name}</td>
                      <td>{formatAmount(invoice.amount)}</td>
                      <td>{formatDate(invoice.due_date)}</td>
                      <td>{invoice.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-dashboard-panel">
          <h2>Team members</h2>

          {team.length === 0 ? (
            <p>No staff profiles were found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th align="left">Name</th>
                    <th align="left">Email</th>
                    <th align="left">Role</th>
                    <th align="left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id}>
                      <td>{member.full_name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.is_active ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
