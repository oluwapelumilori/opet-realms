
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  FileText,
  Users,
  LogOut,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Save,
  Plus,
  ClipboardList,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const panelStyle = {
  background: '#ffffff',
  border: '1px solid #e2e9e4',
  borderRadius: 14,
  padding: 22,
  marginBottom: 22,
}

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 42,
  padding: '10px 16px',
  border: 'none',
  borderRadius: 8,
  background: '#087f5b',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer',
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 42,
  padding: '10px 12px',
  border: '1px solid #d7e1da',
  borderRadius: 8,
  background: '#ffffff',
  color: '#17231d',
  font: 'inherit',
}

const labelStyle = {
  display: 'grid',
  gap: 6,
  color: '#34443a',
  fontSize: 14,
  fontWeight: 600,
}

const emptyPermissions = {
  view_bookings: false,
  manage_bookings: false,
  view_invoices: false,
  manage_invoices: false,
}

const emptySettings = {
  business_name: '',
  phone: '',
  whatsapp_number: '',
  email: '',
  address: '',
  bank_name: '',
  account_number: '',
  account_name: '',
  default_invoice_payment_terms: '',
  default_invoice_notes: '',
  quote_validity_days: 7,
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [staffName, setStaffName] = useState('Admin')
  const [bookings, setBookings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [team, setTeam] = useState([])
  const [staffPermissions, setStaffPermissions] = useState({})
  const [permissionSaving, setPermissionSaving] = useState({})
  const [settings, setSettings] = useState(emptySettings)
  const [activeSection, setActiveSection] = useState('overview')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [permissionMessage, setPermissionMessage] = useState('')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    service: '',
    property_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  })

  const loadDashboard = useCallback(async () => {
    setError('')
    setSuccess('')

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!session) {
        navigate('/admin/login', { replace: true })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('staff_profiles')
        .select('id, full_name, email, role, is_active')
        .eq('id', session.user.id)
        .maybeSingle()

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
        permissionsResult,
        settingsResult,
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('staff_profiles')
          .select('id, full_name, email, role, is_active, created_at')
          .order('created_at', { ascending: false }),

        supabase
          .from('staff_permissions')
          .select(
            'staff_id, view_bookings, manage_bookings, view_invoices, manage_invoices'
          ),

        supabase
          .from('business_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
      ])

      if (bookingsResult.error) throw bookingsResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (teamResult.error) throw teamResult.error
      if (permissionsResult.error) throw permissionsResult.error

      setBookings(bookingsResult.data || [])
      setInvoices(invoicesResult.data || [])
      setTeam(teamResult.data || [])

      const permissionMap = {}

      ;(permissionsResult.data || []).forEach((permission) => {
        permissionMap[permission.staff_id] = {
          view_bookings: permission.view_bookings,
          manage_bookings: permission.manage_bookings,
          view_invoices: permission.view_invoices,
          manage_invoices: permission.manage_invoices,
        }
      })

      setStaffPermissions(permissionMap)

      if (settingsResult.error) {
        setSettingsLoaded(false)
        console.error('Could not load business settings:', settingsResult.error)
      } else if (settingsResult.data) {
        setSettings({
          ...emptySettings,
          ...settingsResult.data,
          phone: settingsResult.data.phone || '',
          whatsapp_number: settingsResult.data.whatsapp_number || '',
          quote_validity_days:
            settingsResult.data.quote_validity_days ?? 7,
        })
        setSettingsLoaded(true)
      } else {
        setSettingsLoaded(false)
      }
    } catch (err) {
      console.error('Admin dashboard error:', err)
      setError(err.message || 'Unable to load the admin dashboard.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
      return
    }

    navigate('/admin/login', { replace: true })
  }

  async function handleCreateBooking(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSavingBooking(true)

    try {
      const bookingRef = `OR-${Date.now().toString().slice(-8)}`

      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          ...bookingForm,
          booking_ref: bookingRef,
          status: 'new',
          preferred_date: bookingForm.preferred_date || null,
        })

      if (insertError) throw insertError

      setBookingForm({
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        service: '',
        property_type: '',
        preferred_date: '',
        preferred_time: '',
        notes: '',
      })

      setSuccess(`Booking ${bookingRef} created successfully.`)
      setActiveSection('bookings')
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not create the booking.')
    } finally {
      setSavingBooking(false)
    }
  }

  async function updateBookingStatus(bookingId, status) {
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)

      if (updateError) throw updateError

      setSuccess('Booking status updated.')
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update booking status.')
    }
  }

  function toggleStaffPermission(staffId, permission, checked) {
    setStaffPermissions((current) => ({
      ...current,
      [staffId]: {
        ...emptyPermissions,
        ...current[staffId],
        [permission]: checked,
      },
    }))

    setPermissionMessage('')
  }

  async function saveStaffPermissions(staffId) {
    setPermissionSaving((current) => ({
      ...current,
      [staffId]: true,
    }))
    setPermissionMessage('')
    setError('')

    try {
      const permissions = {
        ...emptyPermissions,
        ...staffPermissions[staffId],
      }

      const record = {
        staff_id: staffId,
        view_bookings:
          permissions.view_bookings || permissions.manage_bookings,
        manage_bookings: permissions.manage_bookings,
        view_invoices:
          permissions.view_invoices || permissions.manage_invoices,
        manage_invoices: permissions.manage_invoices,
        updated_at: new Date().toISOString(),
      }

      const { error: saveError } = await supabase
        .from('staff_permissions')
        .upsert(record, { onConflict: 'staff_id' })

      if (saveError) throw saveError

      setStaffPermissions((current) => ({
        ...current,
        [staffId]: {
          view_bookings: record.view_bookings,
          manage_bookings: record.manage_bookings,
          view_invoices: record.view_invoices,
          manage_invoices: record.manage_invoices,
        },
      }))

      setPermissionMessage('Staff permissions saved successfully.')
    } catch (err) {
      setPermissionMessage(
        `Could not save permissions: ${err.message}`
      )
    } finally {
      setPermissionSaving((current) => ({
        ...current,
        [staffId]: false,
      }))
    }
  }

  function updateSetting(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function saveBusinessSettings(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSavingSettings(true)

    try {
      const updates = {
        business_name: settings.business_name.trim(),
        phone: settings.phone.trim() || null,
        whatsapp_number: settings.whatsapp_number.trim() || null,
        email: settings.email.trim(),
        address: settings.address.trim(),
        bank_name: settings.bank_name.trim(),
        account_number: settings.account_number.trim(),
        account_name: settings.account_name.trim(),
        default_invoice_payment_terms:
          settings.default_invoice_payment_terms.trim(),
        default_invoice_notes: settings.default_invoice_notes.trim(),
        quote_validity_days: Number(settings.quote_validity_days),
        updated_at: new Date().toISOString(),
      }

      const { error: saveError } = await supabase
        .from('business_settings')
        .update(updates)
        .eq('id', 1)

      if (saveError) throw saveError

      setSuccess('Business settings saved successfully.')
      setSettingsLoaded(true)
    } catch (err) {
      setError(err.message || 'Could not save business settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Quotes & Bookings', icon: CalendarDays },
    { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ]

  if (loading) {
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
          <LoaderCircle size={32} />
          <p>Loading your admin dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f9f7',
        color: '#17231d',
        padding: '24px 0 48px',
      }}
    >
      <div
        style={{
          width: 'min(1200px, calc(100% - 32px))',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            ...panelStyle,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                color: '#087f5b',
                fontWeight: 700,
                margin: '0 0 4px',
              }}
            >
              OPET REALMS
            </p>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              Admin Dashboard
            </h1>
            <p style={{ margin: '6px 0 0', color: '#68746d' }}>
              Welcome back, {staffName}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={buttonStyle}
              onClick={loadDashboard}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              style={{
                ...buttonStyle,
                background: '#17231d',
              }}
              onClick={handleSignOut}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </header>

        <nav
          aria-label="Admin sections"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 22,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.id

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setError('')
                  setSuccess('')
                }}
                style={{
                  ...buttonStyle,
                  background: active ? '#087f5b' : '#ffffff',
                  color: active ? '#ffffff' : '#17231d',
                  border: '1px solid #e2e9e4',
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {error && (
          <div
            role="alert"
            style={{
              ...panelStyle,
              color: '#9f2424',
              borderColor: '#f0c7c7',
              background: '#fff8f8',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              ...panelStyle,
              color: '#065f46',
              borderColor: '#b9e3cf',
              background: '#f1fbf5',
            }}
          >
            {success}
          </div>
        )}

        {activeSection === 'overview' && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 16,
                marginBottom: 22,
              }}
            >
              {[
                {
                  label: 'Total bookings',
                  value: bookings.length,
                  icon: CalendarDays,
                },
                {
                  label: 'Total invoices',
                  value: invoices.length,
                  icon: FileText,
                },
                {
                  label: 'Staff profiles',
                  value: team.length,
                  icon: Users,
                },
              ].map((card) => {
                const Icon = card.icon

                return (
                  <section key={card.label} style={panelStyle}>
                    <Icon size={24} color="#087f5b" />
                    <p style={{ color: '#68746d', marginBottom: 6 }}>
                      {card.label}
                    </p>
                    <strong style={{ fontSize: 30 }}>
                      {card.value}
                    </strong>
                  </section>
                )
              })}
            </div>

            <section style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>Recent bookings</h2>
              {bookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.booking_ref || '—'}</td>
                          <td>{booking.customer_name || '—'}</td>
                          <td>{booking.service || '—'}</td>
                          <td>{booking.status || 'new'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>Recent invoices</h2>
              {invoices.length === 0 ? (
                <p>No invoices yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 5).map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.invoice_ref || '—'}</td>
                          <td>{invoice.customer_name || '—'}</td>
                          <td>{formatMoney(invoice.amount)}</td>
                          <td>{invoice.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeSection === 'bookings' && (
          <>
            <section style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>
                <Plus size={20} style={{ verticalAlign: 'middle' }} />{' '}
                Create a booking
              </h2>

              <form onSubmit={handleCreateBooking}>
                <div style={formGridStyle}>
                  <label style={labelStyle}>
                    Customer name *
                    <input
                      style={inputStyle}
                      required
                      value={bookingForm.customer_name}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          customer_name: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Phone *
                    <input
                      style={inputStyle}
                      required
                      value={bookingForm.phone}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          phone: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Email
                    <input
                      type="email"
                      style={inputStyle}
                      value={bookingForm.email}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Service *
                    <input
                      style={inputStyle}
                      required
                      placeholder="e.g. Deep cleaning"
                      value={bookingForm.service}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          service: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Property type
                    <input
                      style={inputStyle}
                      placeholder="e.g. Apartment, office"
                      value={bookingForm.property_type}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          property_type: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Preferred date
                    <input
                      type="date"
                      style={inputStyle}
                      value={bookingForm.preferred_date}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          preferred_date: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Preferred time
                    <input
                      style={inputStyle}
                      placeholder="e.g. 10:00 AM"
                      value={bookingForm.preferred_time}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          preferred_time: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelStyle}>
                    Address *
                    <input
                      style={inputStyle}
                      required
                      value={bookingForm.address}
                      onChange={(event) =>
                        setBookingForm({
                          ...bookingForm,
                          address: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <label style={{ ...labelStyle, marginTop: 16 }}>
                  Notes
                  <textarea
                    style={{ ...inputStyle, minHeight: 90 }}
                    value={bookingForm.notes}
                    onChange={(event) =>
                      setBookingForm({
                        ...bookingForm,
                        notes: event.target.value,
                      })
                    }
                  />
                </label>

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: 16 }}
                  disabled={savingBooking}
                >
                  {savingBooking ? 'Creating...' : 'Create booking'}
                </button>
              </form>
            </section>

            <section style={panelStyle}>
              <h2 style={{ marginTop: 0 }}>
                <ClipboardList size={20} style={{ verticalAlign: 'middle' }} />{' '}
                All bookings
              </h2>

              {bookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.booking_ref || '—'}</td>
                          <td>{booking.customer_name || '—'}</td>
                          <td>{booking.phone || '—'}</td>
                          <td>{booking.service || '—'}</td>
                          <td>{booking.preferred_date || '—'}</td>
                          <td>
                            <select
                              style={inputStyle}
                              value={booking.status || 'new'}
                              onChange={(event) =>
                                updateBookingStatus(
                                  booking.id,
                                  event.target.value
                                )
                              }
                            >
                              {[
                                'new',
                                'pending',
                                'confirmed',
                                'in_progress',
                                'completed',
                                'cancelled',
                              ].map((status) => (
                                <option key={status} value={status}>
                                  {status.replaceAll('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeSection === 'invoices' && (
          <section style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>
              <FileText size={21} style={{ verticalAlign: 'middle' }} />{' '}
              Invoices & Receipts
            </h2>
            <p>
              This section displays the invoices currently saved in Supabase.
              Invoice creation, payment confirmation and receipt generation
              need their own workflow.
            </p>

            {invoices.length === 0 ? (
              <p>No invoices found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th>Invoice reference</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Issue date</th>
                      <th>Due date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoice_ref || '—'}</td>
                        <td>{invoice.customer_name || '—'}</td>
                        <td>{formatMoney(invoice.amount)}</td>
                        <td>{invoice.issue_date || '—'}</td>
                        <td>{invoice.due_date || '—'}</td>
                        <td>{invoice.status || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === 'staff' && (
          <section style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>
              <ShieldCheck size={22} style={{ verticalAlign: 'middle' }} />{' '}
              Staff Management
            </h2>
            <p style={{ color: '#68746d' }}>
              Grant individual access to bookings and invoices. Business and
              bank settings remain restricted to administrators.
            </p>

            {permissionMessage && (
              <p role="status" style={{ color: '#087f5b' }}>
                {permissionMessage}
              </p>
            )}

            {team.length === 0 ? (
              <p>No staff profiles were found.</p>
            ) : (
              team.map((member) => {
                const permissions = {
                  ...emptyPermissions,
                  ...staffPermissions[member.id],
                }
                const isAdmin = member.role === 'admin'
                const isSaving = Boolean(permissionSaving[member.id])

                return (
                  <article
                    key={member.id}
                    style={{
                      border: '1px solid #e2e9e4',
                      borderRadius: 12,
                      padding: 18,
                      marginTop: 16,
                    }}
                  >
                    <h3 style={{ marginTop: 0 }}>
                      {member.full_name || 'Unnamed staff member'}
                    </h3>
                    <p style={{ margin: '4px 0' }}>
                      {member.email || 'No email'}
                    </p>
                    <p style={{ color: '#68746d', margin: '4px 0 16px' }}>
                      Role: {member.role} ·{' '}
                      {member.is_active ? 'Active' : 'Inactive'}
                    </p>

                    {isAdmin ? (
                      <p>
                        This administrator retains full access. Their
                        permissions cannot be restricted here.
                      </p>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gap: 12 }}>
                          {[
                            [
                              'view_bookings',
                              'View bookings and customer contact details',
                            ],
                            ['manage_bookings', 'Manage bookings'],
                            ['view_invoices', 'View invoices'],
                            ['manage_invoices', 'Create and manage invoices'],
                          ].map(([key, label]) => (
                            <label
                              key={key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontWeight: 500,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(permissions[key])}
                                onChange={(event) =>
                                  toggleStaffPermission(
                                    member.id,
                                    key,
                                    event.target.checked
                                  )
                                }
                                disabled={!member.is_active || isSaving}
                              />
                              {label}
                            </label>
                          ))}
                        </div>

                        <button
                          type="button"
                          style={{ ...buttonStyle, marginTop: 16 }}
                          disabled={!member.is_active || isSaving}
                          onClick={() => saveStaffPermissions(member.id)}
                        >
                          <Save size={17} />
                          {isSaving ? 'Saving...' : 'Save permissions'}
                        </button>
                      </>
                    )}
                  </article>
                )
              })
            )}
          </section>
        )}

        {activeSection === 'settings' && (
          <section style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>
              <Settings size={22} style={{ verticalAlign: 'middle' }} />{' '}
              Business Settings
            </h2>
            <p style={{ color: '#68746d' }}>
              Manage the business contact details and bank information used
              for quotes and invoices.
            </p>

            {!settingsLoaded ? (
              <p>
                Business settings could not be loaded. Refresh the dashboard
                and check that the record with id 1 exists in
                business_settings.
              </p>
            ) : (
              <form onSubmit={saveBusinessSettings}>
                <div style={formGridStyle}>
                  {[
                    ['business_name', 'Business name'],
                    ['phone', 'Business phone'],
                    ['whatsapp_number', 'WhatsApp number'],
                    ['email', 'Business email'],
                    ['address', 'Business address'],
                    ['bank_name', 'Bank name'],
                    ['account_number', 'Account number'],
                    ['account_name', 'Account name'],
                  ].map(([field, label]) => (
                    <label key={field} style={labelStyle}>
                      {label}
                      <input
                        style={inputStyle}
                        type={field === 'email' ? 'email' : 'text'}
                        value={settings[field] ?? ''}
                        onChange={(event) =>
                          updateSetting(field, event.target.value)
                        }
                        required={
                          [
                            'business_name',
                            'email',
                            'address',
                            'bank_name',
                            'account_number',
                            'account_name',
                          ].includes(field)
                        }
                      />
                    </label>
                  ))}

                  <label style={labelStyle}>
                    Quote validity (days)
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={settings.quote_validity_days}
                      onChange={(event) =>
                        updateSetting(
                          'quote_validity_days',
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>
                </div>

                <label style={{ ...labelStyle, marginTop: 16 }}>
                  Default invoice payment terms
                  <textarea
                    style={{ ...inputStyle, minHeight: 80 }}
                    value={settings.default_invoice_payment_terms}
                    onChange={(event) =>
                      updateSetting(
                        'default_invoice_payment_terms',
                        event.target.value
                      )
                    }
                  />
                </label>

                <label style={{ ...labelStyle, marginTop: 16 }}>
                  Default invoice notes
                  <textarea
                    style={{ ...inputStyle, minHeight: 110 }}
                    value={settings.default_invoice_notes}
                    onChange={(event) =>
                      updateSetting(
                        'default_invoice_notes',
                        event.target.value
                      )
                    }
                  />
                </label>

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: 18 }}
                  disabled={savingSettings}
                >
                  <Save size={17} />
                  {savingSettings ? 'Saving...' : 'Save business settings'}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
}

function formatMoney(amount) {
  const value = Number(amount)

  if (!Number.isFinite(value)) return '—'

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(value)
}
