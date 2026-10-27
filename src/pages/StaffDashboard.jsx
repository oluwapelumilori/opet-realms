import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  FileText,
  LogOut,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Save,
  Plus,
  Search,
  MessageCircle,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const GREEN = '#087f5b'
const DARK = '#17231d'
const MUTED = '#68746d'
const BORDER = '#e2e9e4'

const BOOKING_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const panelStyle = {
  background: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  padding: 18,
  marginBottom: 18,
  minWidth: 0,
}

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  minHeight: 40,
  padding: '9px 13px',
  border: '1px solid transparent',
  borderRadius: 8,
  background: GREEN,
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 40,
  padding: '9px 11px',
  border: `1px solid ${BORDER}`,
  borderRadius: 7,
  background: '#fff',
  color: DARK,
  font: 'inherit',
  fontSize: 14,
}

const labelStyle = {
  display: 'grid',
  gap: 5,
  color: '#34443a',
  fontSize: 13,
  fontWeight: 600,
  minWidth: 0,
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 14,
}

const tableStyle = {
  width: '100%',
  minWidth: 650,
  borderCollapse: 'collapse',
  fontSize: 13,
}

const thStyle = {
  padding: '11px 12px',
  textAlign: 'left',
  color: MUTED,
  background: '#f6f9f7',
  borderBottom: `1px solid ${BORDER}`,
  whiteSpace: 'nowrap',
  fontWeight: 700,
}

const tdStyle = {
  padding: '12px',
  borderBottom: `1px solid ${BORDER}`,
  verticalAlign: 'top',
}

const noPermissions = {
  view_bookings: false,
  manage_bookings: false,
  view_invoices: false,
  manage_invoices: false,
}

// Used on invoices when business settings cannot be read by this account.
const defaultBankSettings = {
  bank_name: 'Moniepoint MFB',
  account_number: '6748383853',
  account_name: 'Opet Realms',
  default_invoice_notes: '',
}

const emptyBookingForm = {
  customer_name: '',
  phone: '',
  email: '',
  address: '',
  service: '',
  property_type: '',
  preferred_date: '',
  preferred_time: '',
  notes: '',
}

const emptyInvoiceForm = {
  booking_id: '',
  customer_name: '',
  amount: '',
  description: '',
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  notes: '',
  payment_option: 'full',
}

function normalizeStatus(status) {
  const value = String(status || 'new').trim().toLowerCase()
  const legacy = { pending: 'contacted', confirmed: 'booked' }
  return legacy[value] || value
}

function formatStatus(status) {
  const value = normalizeStatus(status)
  const match = BOOKING_STATUSES.find((item) => item.value === value)
  return match ? match.label : value.replaceAll('_', ' ')
}

function formatMoney(value) {
  const amount = Number(value || 0)
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function makeReference(prefix) {
  return `${prefix}-${Date.now().toString().slice(-8)}`
}

function whatsappUrl(phone, message = '') {
  const number = String(phone || '').replace(/\D/g, '')
  if (!number) return ''
  const international = number.startsWith('0')
    ? `234${number.slice(1)}`
    : number
  return `https://wa.me/${international}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

function StatusPill({ status }) {
  const normalized = normalizeStatus(status)
  const colors = {
    new: ['#e8f1ff', '#1d4ed8'],
    contacted: ['#fff4d6', '#92400e'],
    inspection: ['#f3e8ff', '#7e22ce'],
    booked: ['#dff7e9', '#166534'],
    completed: ['#dff7e9', '#166534'],
    cancelled: ['#fee2e2', '#991b1b'],
    paid: ['#dff7e9', '#166534'],
    unpaid: ['#fff4d6', '#92400e'],
    pending: ['#fff4d6', '#92400e'],
  }
  const [background, color] = colors[normalized] || ['#eef2ef', DARK]

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 20,
        padding: '4px 9px',
        background,
        color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {formatStatus(status)}
    </span>
  )
}

function SectionHeading({ children, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            lineHeight: 1.4,
            fontWeight: 700,
            color: DARK,
          }}
        >
          {children}
        </h2>
        {description && (
          <p style={{ color: MUTED, fontSize: 13, margin: '4px 0 0' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export default function StaffDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [staffName, setStaffName] = useState('Team member')

  const [permissions, setPermissions] = useState(noPermissions)
  const [bookings, setBookings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [bankSettings, setBankSettings] = useState(defaultBankSettings)

  const [activeSection, setActiveSection] = useState('overview')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [bookingForm, setBookingForm] = useState(emptyBookingForm)
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)

  const loadDashboard = useCallback(async () => {
    setError('')

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

      if (!profile || !profile.is_active) {
        await supabase.auth.signOut()
        navigate('/admin/login', { replace: true })
        return
      }

      // Admins use the full dashboard.
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true })
        return
      }

      setStaffName(profile.full_name || 'Team member')

      const { data: permissionRow, error: permissionError } = await supabase
        .from('staff_permissions')
        .select(
          'view_bookings, manage_bookings, view_invoices, manage_invoices'
        )
        .eq('staff_id', session.user.id)
        .maybeSingle()

      if (permissionError) throw permissionError

      const granted = {
        view_bookings: Boolean(
          permissionRow?.view_bookings || permissionRow?.manage_bookings
        ),
        manage_bookings: Boolean(permissionRow?.manage_bookings),
        view_invoices: Boolean(
          permissionRow?.view_invoices || permissionRow?.manage_invoices
        ),
        manage_invoices: Boolean(permissionRow?.manage_invoices),
      }
      setPermissions(granted)

      const none = { data: [], error: null }

      const [bookingsResult, invoicesResult, settingsResult] =
        await Promise.all([
          granted.view_bookings
            ? supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
            : Promise.resolve(none),

          granted.view_invoices
            ? supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false })
            : Promise.resolve(none),

          granted.manage_invoices
            ? supabase
                .from('business_settings')
                .select(
                  'bank_name, account_name, account_number, default_invoice_notes'
                )
                .eq('id', 1)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ])

      if (bookingsResult.error) throw bookingsResult.error
      if (invoicesResult.error) throw invoicesResult.error

      setBookings(bookingsResult.data || [])
      setInvoices(invoicesResult.data || [])

      // Bank details are optional for staff. Fall back to the defaults if
      // this account is not allowed to read business settings.
      if (!settingsResult.error && settingsResult.data) {
        setBankSettings({
          bank_name:
            settingsResult.data.bank_name || defaultBankSettings.bank_name,
          account_name:
            settingsResult.data.account_name ||
            defaultBankSettings.account_name,
          account_number:
            settingsResult.data.account_number ||
            defaultBankSettings.account_number,
          default_invoice_notes:
            settingsResult.data.default_invoice_notes || '',
        })
      }
    } catch (err) {
      console.error('Staff dashboard error:', err)
      setError(err.message || 'Unable to load your dashboard.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const bookingCounts = useMemo(() => {
    const counts = Object.fromEntries(
      BOOKING_STATUSES.map((status) => [status.value, 0])
    )

    bookings.forEach((booking) => {
      const status = normalizeStatus(booking.status)
      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1
      }
    })

    return counts
  }, [bookings])

  const filteredBookings = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase()

    return bookings.filter((booking) => {
      const matchesStatus =
        bookingStatusFilter === 'all' ||
        normalizeStatus(booking.status) === bookingStatusFilter

      const searchable = [
        booking.booking_ref,
        booking.customer_name,
        booking.phone,
        booking.email,
        booking.service,
        booking.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesStatus && (!query || searchable.includes(query))
    })
  }, [bookings, bookingStatusFilter, bookingSearch])

  const filteredInvoices = useMemo(() => {
    const query = invoiceSearch.trim().toLowerCase()
    if (!query) return invoices

    return invoices.filter((invoice) =>
      [
        invoice.invoice_ref,
        invoice.customer_name,
        invoice.status,
        invoice.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [invoices, invoiceSearch])

  const navItems = useMemo(
    () =>
      [
        (permissions.view_bookings || permissions.view_invoices) && {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
        },
        permissions.view_bookings && {
          id: 'bookings',
          label: 'Quotes & Bookings',
          icon: CalendarDays,
        },
        permissions.view_invoices && {
          id: 'invoices',
          label: 'Invoices & Receipts',
          icon: FileText,
        },
      ].filter(Boolean),
    [permissions]
  )

  const currentSection = navItems.some((item) => item.id === activeSection)
    ? activeSection
    : navItems[0]?.id

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

    if (!permissions.manage_bookings) {
      setError('You do not have permission to create bookings.')
      return
    }

    setSavingBooking(true)

    try {
      const bookingRef = makeReference('OR')

      const payload = {
        ...bookingForm,
        booking_ref: bookingRef,
        status: 'new',
        preferred_date: bookingForm.preferred_date || null,
        preferred_time: bookingForm.preferred_time || null,
        email: bookingForm.email.trim() || null,
        notes: bookingForm.notes.trim() || null,
      }

      const { error: insertError } = await supabase
        .from('bookings')
        .insert(payload)

      if (insertError) throw insertError

      setBookingForm({ ...emptyBookingForm })
      setBookingStatusFilter('all')
      setBookingSearch('')
      setShowBookingForm(false)
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

    if (!permissions.manage_bookings) {
      setError('You do not have permission to change booking status.')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (updateError) throw updateError

      setSuccess(`Booking status updated to ${formatStatus(status)}.`)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update booking status.')
    }
  }

  function openBookingStage(status) {
    setBookingStatusFilter(status)
    setActiveSection('bookings')
    setError('')
    setSuccess('')
  }

  function selectBookingForInvoice(booking) {
    setInvoiceForm((current) => ({
      ...current,
      booking_id: booking.id,
      customer_name: booking.customer_name || '',
      description: [booking.service, booking.property_type]
        .filter(Boolean)
        .join(' — '),
      notes: bankSettings.default_invoice_notes || '',
    }))
    setActiveSection('invoices')
    setSuccess('')
    setError('')
  }

  async function handleCreateInvoice(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!permissions.manage_invoices) {
      setError('You do not have permission to create invoices.')
      return
    }

    setSavingInvoice(true)

    try {
      const amount = Number(invoiceForm.amount)

      if (!invoiceForm.customer_name.trim()) {
        throw new Error('Enter the customer name.')
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Enter a valid invoice amount.')
      }

      const invoiceRef = makeReference('INV')
      const depositAmount =
        invoiceForm.payment_option === 'deposit'
          ? Math.round(amount * 0.7 * 100) / 100
          : amount

      const invoicePayload = {
        invoice_ref: invoiceRef,
        booking_id: invoiceForm.booking_id || null,
        customer_name: invoiceForm.customer_name.trim(),
        amount,
        status: 'unpaid',
        issue_date: invoiceForm.issue_date || null,
        due_date: invoiceForm.due_date || null,
        notes: [
          invoiceForm.description.trim(),
          invoiceForm.notes.trim(),
          invoiceForm.payment_option === 'deposit'
            ? `70% deposit due: ${formatMoney(depositAmount)}. Balance: ${formatMoney(amount - depositAmount)}.`
            : '',
          `Bank: ${bankSettings.bank_name}`,
          `Account name: ${bankSettings.account_name}`,
          `Account number: ${bankSettings.account_number}`,
        ]
          .filter(Boolean)
          .join('\n'),
      }

      const { error: insertError } = await supabase
        .from('invoices')
        .insert(invoicePayload)

      if (insertError) throw insertError

      setInvoiceForm({ ...emptyInvoiceForm })
      setSuccess(`Invoice ${invoiceRef} created successfully.`)
      await loadDashboard()
    } catch (err) {
      setError(
        err.message ||
          'Could not create the invoice. Check that the invoice fields match your Supabase table.'
      )
    } finally {
      setSavingInvoice(false)
    }
  }

  async function updateInvoiceStatus(invoiceId, status) {
    setError('')
    setSuccess('')

    if (!permissions.manage_invoices) {
      setError('You do not have permission to change invoice status.')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invoiceId)

      if (updateError) throw updateError

      setSuccess(`Invoice marked ${status}.`)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update invoice status.')
    }
  }

  function renderBookingStatusCards() {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {BOOKING_STATUSES.map((status) => {
          const active =
            currentSection === 'bookings' &&
            bookingStatusFilter === status.value

          return (
            <button
              key={status.value}
              type="button"
              onClick={() => openBookingStage(status.value)}
              aria-pressed={active}
              style={{
                ...panelStyle,
                marginBottom: 0,
                textAlign: 'left',
                cursor: 'pointer',
                border: active ? `2px solid ${GREEN}` : `1px solid ${BORDER}`,
                padding: 13,
                background: active ? '#f0faf5' : '#fff',
                color: DARK,
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: MUTED,
                  marginBottom: 5,
                }}
              >
                {status.label}
              </span>
              <strong style={{ fontSize: 23, lineHeight: 1.2 }}>
                {bookingCounts[status.value]}
              </strong>
            </button>
          )
        })}
      </div>
    )
  }

  function renderBookingsTable(rows) {
    if (rows.length === 0) {
      return (
        <p style={{ color: MUTED, fontSize: 13 }}>
          No bookings match your search.
        </p>
      )
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                'Reference',
                'Customer',
                'Service / Property',
                'Preferred date',
                'Status',
                'Actions',
              ].map((heading) => (
                <th key={heading} style={thStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => {
              const message = `Hello ${booking.customer_name || ''}, we are contacting you about your Opet Realms booking ${booking.booking_ref || ''} for ${booking.service || 'our cleaning service'}.`
              const chatUrl = whatsappUrl(booking.phone, message)

              return (
                <tr key={booking.id}>
                  <td style={tdStyle}>
                    <strong>{booking.booking_ref || '—'}</strong>
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
                      {formatDate(booking.created_at?.slice(0, 10))}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <strong>{booking.customer_name || '—'}</strong>
                    <div style={{ color: MUTED, fontSize: 12 }}>
                      {booking.phone || '—'}
                    </div>
                    {booking.email && (
                      <div style={{ color: MUTED, fontSize: 12 }}>
                        {booking.email}
                      </div>
                    )}
                    {booking.address && (
                      <div
                        style={{ color: MUTED, fontSize: 12, marginTop: 3 }}
                      >
                        {booking.address}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {booking.service || '—'}
                    {booking.property_type && (
                      <div style={{ color: MUTED, fontSize: 12 }}>
                        {booking.property_type}
                      </div>
                    )}
                    {booking.notes && (
                      <div
                        style={{ color: MUTED, fontSize: 12, marginTop: 4 }}
                      >
                        {booking.notes}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {formatDate(booking.preferred_date)}
                    {booking.preferred_time && (
                      <div style={{ color: MUTED, fontSize: 12 }}>
                        {booking.preferred_time}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {permissions.manage_bookings ? (
                      <select
                        aria-label={`Status for ${booking.booking_ref || booking.customer_name}`}
                        value={normalizeStatus(booking.status)}
                        onChange={(event) =>
                          updateBookingStatus(booking.id, event.target.value)
                        }
                        style={{
                          ...inputStyle,
                          minWidth: 120,
                          padding: '6px 8px',
                          fontSize: 12,
                        }}
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusPill status={booking.status} />
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {chatUrl && (
                        <a
                          href={chatUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...buttonStyle,
                            textDecoration: 'none',
                            minHeight: 32,
                            padding: '6px 9px',
                            fontSize: 11,
                          }}
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      )}
                      {permissions.manage_invoices && (
                        <button
                          type="button"
                          onClick={() => selectBookingForInvoice(booking)}
                          style={{
                            ...buttonStyle,
                            background: DARK,
                            minHeight: 32,
                            padding: '6px 9px',
                            fontSize: 11,
                          }}
                        >
                          <FileText size={14} /> Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  function renderInvoicesTable(rows, { showDueDate, showActions }) {
    if (rows.length === 0) {
      return <p style={{ color: MUTED, fontSize: 13 }}>No invoices found.</p>
    }

    const headings = [
      'Invoice',
      'Customer',
      'Amount',
      'Issue date',
      ...(showDueDate ? ['Due date'] : []),
      'Status',
    ]

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading} style={thStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((invoice) => (
              <tr key={invoice.id}>
                <td style={tdStyle}>
                  <strong>{invoice.invoice_ref || '—'}</strong>
                  {invoice.booking_id && (
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>
                      Booking linked
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{invoice.customer_name || '—'}</td>
                <td style={tdStyle}>{formatMoney(invoice.amount)}</td>
                <td style={tdStyle}>{formatDate(invoice.issue_date)}</td>
                {showDueDate && (
                  <td style={tdStyle}>{formatDate(invoice.due_date)}</td>
                )}
                <td style={tdStyle}>
                  {showActions && permissions.manage_invoices ? (
                    <select
                      aria-label={`Payment status for ${invoice.invoice_ref || invoice.customer_name}`}
                      value={String(invoice.status || 'unpaid').toLowerCase()}
                      onChange={(event) =>
                        updateInvoiceStatus(invoice.id, event.target.value)
                      }
                      style={{
                        ...inputStyle,
                        minWidth: 110,
                        padding: '6px 8px',
                        fontSize: 12,
                      }}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  ) : (
                    <StatusPill status={invoice.status || 'unpaid'} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
          color: GREEN,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LoaderCircle size={30} />
          <p>Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  const hasAnyAccess = navItems.length > 0
  const unpaidInvoices = invoices.filter(
    (invoice) =>
      !['paid', 'completed'].includes(
        String(invoice.status || '').toLowerCase()
      )
  ).length

  const summaryCards = [
    permissions.view_bookings && {
      label: 'Total bookings',
      value: bookings.length,
      icon: CalendarDays,
    },
    permissions.view_invoices && {
      label: 'Total invoices',
      value: invoices.length,
      icon: FileText,
    },
    permissions.view_invoices && {
      label: 'Unpaid invoices',
      value: unpaidInvoices,
      icon: ShieldCheck,
    },
  ].filter(Boolean)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f6f9f7',
        color: DARK,
        padding: '20px 0 42px',
      }}
    >
      <div
        style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto' }}
      >
        <header
          style={{
            ...panelStyle,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                color: GREEN,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 1,
                margin: '0 0 3px',
              }}
            >
              OPET REALMS
            </p>
            <h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.3 }}>
              Staff Dashboard
            </h1>
            <p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>
              Welcome back, {staffName}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={buttonStyle} onClick={loadDashboard}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              type="button"
              style={{ ...buttonStyle, background: DARK }}
              onClick={handleSignOut}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </header>

        {hasAnyAccess && (
          <nav
            aria-label="Staff sections"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 7,
              marginBottom: 18,
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = currentSection === item.id

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
                    background: active ? GREEN : '#fff',
                    color: active ? '#fff' : DARK,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Icon size={15} /> {item.label}
                </button>
              )
            })}
          </nav>
        )}

        {error && (
          <div
            role="alert"
            style={{
              ...panelStyle,
              color: '#9f2424',
              borderColor: '#f0c7c7',
              background: '#fff8f8',
              fontSize: 13,
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
              fontSize: 13,
            }}
          >
            {success}
          </div>
        )}

        {!hasAnyAccess && !error && (
          <section style={panelStyle}>
            <SectionHeading description="Your account is active, but no sections have been assigned to you yet.">
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
              >
                <ShieldCheck size={18} color={GREEN} /> No access yet
              </span>
            </SectionHeading>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
              Ask an admin to turn on your permissions in Staff Management,
              then press Refresh.
            </p>
          </section>
        )}

        {currentSection === 'overview' && (
          <>
            {summaryCards.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {summaryCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <section
                      key={card.label}
                      style={{ ...panelStyle, marginBottom: 0 }}
                    >
                      <Icon size={21} color={GREEN} />
                      <p
                        style={{
                          color: MUTED,
                          margin: '8px 0 3px',
                          fontSize: 12,
                        }}
                      >
                        {card.label}
                      </p>
                      <strong style={{ fontSize: 26, lineHeight: 1.2 }}>
                        {card.value}
                      </strong>
                    </section>
                  )
                })}
              </div>
            )}

            {permissions.view_bookings && (
              <>
                <section style={panelStyle}>
                  <SectionHeading description="Select a stage to open bookings at that point in the workflow.">
                    Booking stages
                  </SectionHeading>
                  {renderBookingStatusCards()}
                </section>

                <section style={panelStyle}>
                  <SectionHeading
                    description="The latest customer bookings."
                    action={
                      <button
                        type="button"
                        style={buttonStyle}
                        onClick={() => setActiveSection('bookings')}
                      >
                        View bookings
                      </button>
                    }
                  >
                    Recent bookings
                  </SectionHeading>
                  {renderBookingsTable(bookings.slice(0, 5))}
                </section>
              </>
            )}

            {permissions.view_invoices && (
              <section style={panelStyle}>
                <SectionHeading
                  description="Recently created invoices."
                  action={
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => setActiveSection('invoices')}
                    >
                      View invoices
                    </button>
                  }
                >
                  Recent invoices
                </SectionHeading>
                {invoices.length === 0 ? (
                  <p style={{ color: MUTED, fontSize: 13 }}>
                    No invoices yet.
                  </p>
                ) : (
                  renderInvoicesTable(invoices.slice(0, 5), {
                    showDueDate: false,
                    showActions: false,
                  })
                )}
              </section>
            )}
          </>
        )}

        {currentSection === 'bookings' && (
          <>
            <section style={panelStyle}>
              <SectionHeading description="Choose a stage to filter bookings.">
                Booking stages
              </SectionHeading>
              {renderBookingStatusCards()}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                  gap: 12,
                }}
              >
                <label style={labelStyle}>
                  Filter by status
                  <select
                    style={inputStyle}
                    value={bookingStatusFilter}
                    onChange={(event) =>
                      setBookingStatusFilter(event.target.value)
                    }
                  >
                    <option value="all">
                      All bookings ({bookings.length})
                    </option>
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label} ({bookingCounts[status.value]})
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Search bookings
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 11,
                        color: MUTED,
                      }}
                    />
                    <input
                      style={{ ...inputStyle, paddingLeft: 34 }}
                      placeholder="Name, phone, reference, service..."
                      value={bookingSearch}
                      onChange={(event) => setBookingSearch(event.target.value)}
                    />
                  </div>
                </label>
              </div>
            </section>

            {permissions.manage_bookings && (
              <section style={panelStyle}>
                <SectionHeading
                  description="Add a booking received by phone, WhatsApp, or another channel."
                  action={
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => setShowBookingForm((value) => !value)}
                    >
                      {showBookingForm ? <X size={15} /> : <Plus size={15} />}
                      {showBookingForm ? 'Close form' : 'Create booking'}
                    </button>
                  }
                >
                  Create a booking
                </SectionHeading>

                {showBookingForm && (
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
                          placeholder="e.g. Deep Cleaning"
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
                        Property type / size
                        <input
                          style={inputStyle}
                          placeholder="e.g. 4-bedroom duplex"
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
                        Address / area *
                        <input
                          style={inputStyle}
                          required
                          placeholder="Customer's service address"
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

                    <label style={{ ...labelStyle, marginTop: 14 }}>
                      Notes
                      <textarea
                        style={{
                          ...inputStyle,
                          minHeight: 80,
                          resize: 'vertical',
                        }}
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
                      style={{ ...buttonStyle, marginTop: 14 }}
                      disabled={savingBooking}
                    >
                      {savingBooking ? (
                        <LoaderCircle size={15} />
                      ) : (
                        <Plus size={15} />
                      )}
                      {savingBooking ? 'Creating booking...' : 'Save booking'}
                    </button>
                  </form>
                )}
              </section>
            )}

            <section style={panelStyle}>
              <SectionHeading
                description={`${filteredBookings.length} booking(s) found.${
                  permissions.manage_bookings
                    ? ''
                    : ' You have view-only access to bookings.'
                }`}
              >
                All bookings
              </SectionHeading>
              {renderBookingsTable(filteredBookings)}
            </section>
          </>
        )}

        {currentSection === 'invoices' && (
          <>
            {permissions.manage_invoices && (
              <section style={panelStyle}>
                <SectionHeading description="Create an invoice for an existing booking or enter a customer manually.">
                  Create an invoice
                </SectionHeading>

                <form onSubmit={handleCreateInvoice}>
                  <div style={formGridStyle}>
                    <label style={labelStyle}>
                      Link to booking (optional)
                      <select
                        style={inputStyle}
                        value={invoiceForm.booking_id}
                        onChange={(event) => {
                          const selected = bookings.find(
                            (booking) => booking.id === event.target.value
                          )
                          setInvoiceForm({
                            ...invoiceForm,
                            booking_id: event.target.value,
                            customer_name:
                              selected?.customer_name ||
                              invoiceForm.customer_name,
                            description: selected
                              ? [selected.service, selected.property_type]
                                  .filter(Boolean)
                                  .join(' — ')
                              : invoiceForm.description,
                          })
                        }}
                      >
                        <option value="">
                          No linked booking / manual invoice
                        </option>
                        {bookings.map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.booking_ref || 'Booking'} —{' '}
                            {booking.customer_name || 'Customer'}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={labelStyle}>
                      Customer name *
                      <input
                        style={inputStyle}
                        required
                        value={invoiceForm.customer_name}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            customer_name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label style={labelStyle}>
                      Invoice amount (₦) *
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        style={inputStyle}
                        required
                        value={invoiceForm.amount}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            amount: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label style={labelStyle}>
                      Payment option
                      <select
                        style={inputStyle}
                        value={invoiceForm.payment_option}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            payment_option: event.target.value,
                          })
                        }
                      >
                        <option value="full">Full payment</option>
                        <option value="deposit">70% deposit + balance</option>
                      </select>
                    </label>

                    <label style={labelStyle}>
                      Issue date
                      <input
                        type="date"
                        style={inputStyle}
                        value={invoiceForm.issue_date}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            issue_date: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label style={labelStyle}>
                      Due date
                      <input
                        type="date"
                        style={inputStyle}
                        value={invoiceForm.due_date}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            due_date: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label style={labelStyle}>
                      Service / description
                      <input
                        style={inputStyle}
                        placeholder="e.g. Deep cleaning — 4-bedroom flat"
                        value={invoiceForm.description}
                        onChange={(event) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            description: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  {invoiceForm.payment_option === 'deposit' &&
                    Number(invoiceForm.amount) > 0 && (
                      <div
                        style={{
                          background: '#f0faf5',
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 12,
                          marginTop: 14,
                          fontSize: 13,
                        }}
                      >
                        <strong>70% deposit:</strong>{' '}
                        {formatMoney(Number(invoiceForm.amount) * 0.7)}
                        <span style={{ margin: '0 12px', color: MUTED }}>·</span>
                        <strong>Remaining balance:</strong>{' '}
                        {formatMoney(Number(invoiceForm.amount) * 0.3)}
                      </div>
                    )}

                  <label style={{ ...labelStyle, marginTop: 14 }}>
                    Invoice notes
                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: 75,
                        resize: 'vertical',
                      }}
                      value={invoiceForm.notes}
                      onChange={(event) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          notes: event.target.value,
                        })
                      }
                      placeholder="Additional payment instructions or notes"
                    />
                  </label>

                  <div
                    style={{
                      background: '#f6f9f7',
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      padding: 13,
                      marginTop: 14,
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    <strong>Bank transfer details</strong>
                    <div>{bankSettings.bank_name}</div>
                    <div>Account name: {bankSettings.account_name}</div>
                    <div>Account number: {bankSettings.account_number}</div>
                  </div>

                  <button
                    type="submit"
                    style={{ ...buttonStyle, marginTop: 14 }}
                    disabled={savingInvoice}
                  >
                    {savingInvoice ? (
                      <LoaderCircle size={15} />
                    ) : (
                      <Save size={15} />
                    )}
                    {savingInvoice ? 'Creating invoice...' : 'Create invoice'}
                  </button>
                </form>
              </section>
            )}

            <section style={panelStyle}>
              <SectionHeading
                description={
                  permissions.manage_invoices
                    ? 'Search invoices and update payment status when payment is confirmed.'
                    : 'You have view-only access to invoices.'
                }
              >
                Invoices & receipts
              </SectionHeading>

              <label
                style={{ ...labelStyle, marginBottom: 14, maxWidth: 420 }}
              >
                Search invoices
                <input
                  style={inputStyle}
                  value={invoiceSearch}
                  onChange={(event) => setInvoiceSearch(event.target.value)}
                  placeholder="Invoice reference or customer name"
                />
              </label>

              {renderInvoicesTable(filteredInvoices, {
                showDueDate: true,
                showActions: true,
              })}
            </section>
          </>
        )}

        <footer
          style={{
            textAlign: 'center',
            color: MUTED,
            fontSize: 11,
            padding: '8px 0',
          }}
        >
          Opet Realms · Staff dashboard
        </footer>
      </div>
    </main>
  )
}
