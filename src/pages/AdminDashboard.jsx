
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  Search,
  MessageCircle,
  MoreVertical,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const GREEN = '#16365E' // Opet Realms brand navy
const ACCENT = '#21C9D0' // brand accent
const DARK = '#14243A'
const MUTED = '#66758A'
const BORDER = '#DCE4EE'

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

const menuButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  border: 0,
  borderRadius: 6,
  background: '#fff',
  color: DARK,
  padding: '10px 9px',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'left',
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
  background: '#F5F8FC',
  borderBottom: `1px solid ${BORDER}`,
  whiteSpace: 'nowrap',
  fontWeight: 700,
}

const tdStyle = {
  padding: '12px',
  borderBottom: `1px solid ${BORDER}`,
  verticalAlign: 'top',
}

const emptyPermissions = {
  view_bookings: false,
  manage_bookings: false,
  view_invoices: false,
  manage_invoices: false,
  view_quotes: false,
  manage_quotes: false,
  view_receipts: false,
  manage_receipts: false,
}

const emptySettings = {
  business_name: 'Opet Realms',
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
  payment_terms: '',
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
    draft: ['#eef2ef', DARK],
    sent: ['#e8f1ff', '#1d4ed8'],
    accepted: ['#dff7e9', '#166534'],
    declined: ['#fee2e2', '#991b1b'],
    expired: ['#fff4d6', '#92400e'],
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

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [savingQuote, setSavingQuote] = useState(false)
  const [savingReceipt, setSavingReceipt] = useState(false)
  const [quoteSearch, setQuoteSearch] = useState('')
  const [receiptSearch, setReceiptSearch] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [staffName, setStaffName] = useState('Admin')

  const [bookings, setBookings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [quotes, setQuotes] = useState([])
  const [receipts, setReceipts] = useState([])
  const [team, setTeam] = useState([])
  const [staffPermissions, setStaffPermissions] = useState({})
  const [permissionSaving, setPermissionSaving] = useState({})
  const [settings, setSettings] = useState(emptySettings)

  const [activeSection, setActiveSection] = useState('overview')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [openBookingMenu, setOpenBookingMenu] = useState('')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [showCreateStaffForm, setShowCreateStaffForm] = useState(false)
  const [expandedStaffPermissions, setExpandedStaffPermissions] = useState({})

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [permissionMessage, setPermissionMessage] = useState('')
  const [creatingStaff, setCreatingStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({ full_name: '', email: '', password: '', ...emptyPermissions })
  const [staffActionBusy, setStaffActionBusy] = useState({})
  const [staffResetPasswords, setStaffResetPasswords] = useState({})
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const [bookingForm, setBookingForm] = useState(emptyBookingForm)
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)
  const [quoteForm, setQuoteForm] = useState({ booking_id: '', customer_name: '', customer_phone: '', customer_email: '', service_description: '', amount: '', valid_until: '', notes: '' })
  const [receiptForm, setReceiptForm] = useState({ invoice_id: '', amount_received: '', payment_date: new Date().toISOString().slice(0, 10), payment_method: 'bank_transfer', payment_reference: '', notes: '' })

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

      if (!profile || !profile.is_active || profile.role !== 'admin') {
        await supabase.auth.signOut()
        navigate('/admin/login', { replace: true })
        return
      }

      setStaffName(profile.full_name || 'Admin')

      const [
        bookingsResult,
        invoicesResult,
        quotesResult,
        receiptsResult,
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
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('receipts')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('staff_profiles')
          .select('id, full_name, email, role, is_active, created_at')
          .order('created_at', { ascending: false }),

        supabase
          .from('staff_permissions')
          .select(
            'staff_id, view_bookings, manage_bookings, view_invoices, manage_invoices, view_quotes, manage_quotes, view_receipts, manage_receipts'
          ),

        supabase
          .from('business_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
      ])

      // Bookings are the primary customer requests. A failure in a newer,
      // optional module (quotes, receipts, staff, or invoices) must never stop
      // successfully loaded website requests from appearing in the dashboard.
      if (bookingsResult.error) throw bookingsResult.error
      setBookings(bookingsResult.data || [])

      if (invoicesResult.error) {
        console.error('Could not load invoices:', invoicesResult.error)
        setInvoices([])
      } else {
        setInvoices(invoicesResult.data || [])
      }

      if (quotesResult.error) {
        console.error('Could not load quotations:', quotesResult.error)
        setQuotes([])
        if (activeSection === 'quotes') {
          setError(`Bookings loaded, but quotations could not be loaded: ${quotesResult.error.message}`)
        }
      } else {
        setQuotes(quotesResult.data || [])
      }

      if (receiptsResult.error) {
        console.error('Could not load receipts:', receiptsResult.error)
        setReceipts([])
      } else {
        setReceipts(receiptsResult.data || [])
      }

      if (teamResult.error) {
        console.error('Could not load staff profiles:', teamResult.error)
        setTeam([])
      } else {
        setTeam(teamResult.data || [])
      }

      const permissionMap = {}
      if (permissionsResult.error) {
        console.error('Could not load staff permissions:', permissionsResult.error)
      }
      ;(!permissionsResult.error ? permissionsResult.data || [] : []).forEach((permission) => {
        permissionMap[permission.staff_id] = {
          view_bookings: permission.view_bookings,
          manage_bookings: permission.manage_bookings,
          view_invoices: permission.view_invoices,
          manage_invoices: permission.manage_invoices,
          view_quotes: permission.view_quotes,
          manage_quotes: permission.manage_quotes,
          view_receipts: permission.view_receipts,
          manage_receipts: permission.manage_receipts,
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
          quote_validity_days: settingsResult.data.quote_validity_days ?? 7,
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

  const filteredQuotes = useMemo(() => {
    const query = quoteSearch.trim().toLowerCase()
    return quotes.filter((quote) => !query || [quote.quote_ref, quote.customer_name, quote.service_description, quote.status].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [quotes, quoteSearch])

  const filteredReceipts = useMemo(() => {
    const query = receiptSearch.trim().toLowerCase()
    return receipts.filter((receipt) => !query || [receipt.receipt_ref, receipt.customer_name, receipt.payment_reference, receipt.payment_method].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [receipts, receiptSearch])

  async function handleCreateQuote(event) {
    event.preventDefault()
    setError(''); setSuccess(''); setSavingQuote(true)
    try {
      const selected = bookings.find((booking) => booking.id === quoteForm.booking_id)
      if (!selected) throw new Error('Select an existing booking before creating a quotation.')
      if (!quoteForm.customer_name.trim()) throw new Error('Enter the customer name.')
      if (!quoteForm.service_description.trim()) throw new Error('Enter the quotation description.')
      const amount = Number(quoteForm.amount)
      if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid quotation amount.')
      const quoteRef = makeReference('QUO')
      const { error: insertError } = await supabase.from('quotes').insert({
        quote_ref: quoteRef,
        booking_id: selected.id,
        customer_name: quoteForm.customer_name.trim(),
        customer_phone: quoteForm.customer_phone.trim() || selected?.phone || null,
        customer_email: quoteForm.customer_email.trim() || selected?.email || null,
        service_description: quoteForm.service_description.trim(),
        amount,
        status: 'draft',
        issue_date: new Date().toISOString().slice(0, 10),
        valid_until: quoteForm.valid_until || null,
        notes: quoteForm.notes.trim() || null,
      })
      if (insertError) throw insertError
      setQuoteForm({ booking_id: '', customer_name: '', customer_phone: '', customer_email: '', service_description: '', amount: '', valid_until: '', notes: '' })
      setShowQuoteForm(false)
      setSuccess(`Quotation ${quoteRef} created successfully.`)
      await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create quotation.') }
    finally { setSavingQuote(false) }
  }

  async function updateQuoteStatus(quoteId, status) {
    setError(''); setSuccess('')
    try {
      const { error: updateError } = await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', quoteId)
      if (updateError) throw updateError
      setSuccess(`Quotation status updated to ${status}.`)
      await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update quotation status.') }
  }

  async function handleCreateReceipt(event) {
    event.preventDefault()
    setError(''); setSuccess(''); setSavingReceipt(true)
    try {
      const invoice = invoices.find((item) => item.id === receiptForm.invoice_id)
      if (!invoice) throw new Error('Select an invoice for this receipt.')
      const amountReceived = Number(receiptForm.amount_received)
      if (!Number.isFinite(amountReceived) || amountReceived <= 0) throw new Error('Enter an amount received greater than zero.')
      const receiptRef = makeReference('RCT')
      const { error: insertError } = await supabase.from('receipts').insert({
        receipt_ref: receiptRef,
        invoice_id: invoice.id,
        booking_id: invoice.booking_id || null,
        customer_name: invoice.customer_name,
        amount_received: amountReceived,
        payment_date: receiptForm.payment_date || new Date().toISOString().slice(0, 10),
        payment_method: receiptForm.payment_method,
        payment_reference: receiptForm.payment_reference.trim() || null,
        notes: receiptForm.notes.trim() || null,
      })
      if (insertError) throw insertError
      const alreadyReceived = receipts.filter((item) => item.invoice_id === invoice.id).reduce((sum, item) => sum + Number(item.amount_received || 0), 0)
      if (alreadyReceived + amountReceived >= Number(invoice.amount || 0)) {
        const { error: statusError } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id)
        if (statusError) throw statusError
      } else if (invoice.status === 'draft' || invoice.status === 'sent') {
        const { error: statusError } = await supabase.from('invoices').update({ status: 'unpaid' }).eq('id', invoice.id)
        if (statusError) throw statusError
      }
      setReceiptForm({ invoice_id: '', amount_received: '', payment_date: new Date().toISOString().slice(0, 10), payment_method: 'bank_transfer', payment_reference: '', notes: '' })
      setShowReceiptForm(false)
      setSuccess(`Receipt ${receiptRef} recorded. Only record payments that have been verified.`)
      await loadDashboard()
    } catch (err) { setError(err.message || 'Could not record receipt.') }
    finally { setSavingReceipt(false) }
  }

  function printDocument(title, body) {
    const popup = window.open('', '_blank', 'width=950,height=800')
    if (!popup) {
      setError('Your browser blocked the document window. Allow pop-ups for this site and try again.')
      return
    }
    const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const businessName = safe(settings.business_name || 'Opet Realms')
    const phone = safe(settings.phone || '')
    const email = safe(settings.email || '')
    const address = safe(settings.address || '')
    popup.document.write(`<!doctype html><html><head><title>${safe(title)}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#14243A;margin:0;background:#eef3ef;line-height:1.5;font-size:12px}.sheet{max-width:850px;margin:24px auto;background:#fff;padding:38px 42px;box-shadow:0 4px 24px #102b1b12}.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #16365E;padding-bottom:20px}.logo{display:block;width:170px;max-height:64px;object-fit:contain;object-position:left center;margin-bottom:7px}.brand{font-size:24px;font-weight:800;letter-spacing:.3px;color:#16365E}.tag{font-size:10px;letter-spacing:1.4px;color:#66758A;margin-top:3px}.contact{text-align:right;color:#66758A;font-size:11px;white-space:pre-line}.doc-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin:26px 0 24px}.doc-title{font-size:27px;letter-spacing:.5px;line-height:1.1;margin:0;color:#14243A}.ref{font-size:12px;color:#16365E;font-weight:700;margin-top:8px}.meta{border:1px solid #DCE4EE;border-radius:7px;min-width:205px;overflow:hidden}.meta div{display:flex;justify-content:space-between;gap:18px;padding:7px 10px;border-bottom:1px solid #e8eee9}.meta div:last-child{border:0}.meta span:first-child{color:#66758A}.meta span:last-child{font-weight:700;text-align:right}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:25px}.block-title{font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:#16365E;font-weight:800;margin-bottom:8px}.details{background:#F5F8FC;border:1px solid #DCE4EE;border-radius:7px;padding:13px}.details p{margin:3px 0;overflow-wrap:anywhere}.section{margin:22px 0}.section h3{font-size:12px;margin:0 0 9px;color:#16365E}.description{white-space:pre-wrap;overflow-wrap:anywhere}.total{margin-left:auto;width:300px;max-width:100%;margin-top:14px}.total div{display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid #DCE4EE}.total .grand{background:#16365E;color:#fff;font-weight:800;font-size:15px;border:0;border-radius:0 0 5px 5px}.total .subtle{background:#EEF7FA;font-weight:700}.callout{background:#EEF7FA;border:1px solid #DCE4EE;border-radius:7px;padding:14px;margin-top:18px}.callout h3{margin:0 0 7px;color:#16365E;font-size:12px}.callout p{margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere}.status{display:inline-block;padding:5px 9px;border-radius:99px;background:#EAF4FA;color:#16365E;font-weight:800;text-transform:uppercase;font-size:10px}.foot{border-top:1px solid #DCE4EE;margin-top:30px;padding-top:13px;color:#66758A;font-size:10px;display:flex;justify-content:space-between;gap:12px}.small{color:#66758A;font-size:10px} @media print{body{background:#fff}.sheet{margin:0 auto;padding:20px 24px;box-shadow:none;max-width:none}.no-print{display:none!important}@page{size:A4;margin:10mm}} @media(max-width:620px){.sheet{margin:0;padding:20px}.top,.doc-head{flex-direction:column}.contact{text-align:left}.columns{grid-template-columns:1fr}.meta{width:100%}}
      </style></head><body><main class="sheet"><header class="top"><div><img class="logo" src="https://opet-realms-f2mh.vercel.app/images/opet-realms-logo.png.jpg" alt="Opet Realms logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="brand" style="display:none">${businessName}</div><div class="tag">PROFESSIONAL CLEANING · FUMIGATION · GARMENT CARE</div></div><div class="contact">${phone}${email ? '\n'+email : ''}${address ? '\n'+address : ''}</div></header>${body}<footer class="foot"><span>${businessName}${phone ? ' · '+phone : ''}</span><span>Thank you for choosing Opet Realms.</span></footer></main><script>window.onload=()=>window.print()</script></body></html>`)
    popup.document.close()
  }

  function printQuote(quote) {
    const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const booking = bookings.find((item) => item.id === quote.booking_id)
    const body = `<div class="doc-head"><div><h1 class="doc-title">QUOTATION</h1><div class="ref">${safe(quote.quote_ref || 'Quotation')}</div></div><div class="meta"><div><span>Issue date</span><span>${safe(formatDate(quote.issue_date))}</span></div><div><span>Valid until</span><span>${safe(formatDate(quote.valid_until))}</span></div><div><span>Booking ref.</span><span>${safe(booking?.booking_ref || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Prepared for</div><p><strong>${safe(quote.customer_name || 'Customer')}</strong></p><p>${safe(quote.customer_phone || '')}</p><p>${safe(quote.customer_email || '')}</p></section><section class="details"><div class="block-title">Service details</div><p>${safe(booking?.address || '')}</p><p>${safe(booking?.service || '')}${booking?.property_type ? ' · '+safe(booking.property_type) : ''}</p></section></div><section class="section"><h3>Proposed service</h3><div class="details description">${safe(quote.service_description || 'Service as discussed')}</div><div class="total"><div class="grand"><span>Quotation total</span><span>${safe(formatMoney(quote.amount))}</span></div></div></section>${quote.notes ? `<section class="callout"><h3>Additional notes</h3><p>${safe(quote.notes)}</p></section>` : ''}<section class="callout"><h3>About this quotation</h3><p>This quotation outlines the proposed service and estimated price. Please confirm acceptance before the quotation validity date. Payment arrangements will be stated on the invoice issued for approved work.</p></section>`
    printDocument(quote.quote_ref || 'Quotation', body)
  }

  function printInvoice(invoice) {
    const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const booking = bookings.find((item) => item.id === invoice.booking_id)
    const relatedReceipts = receipts.filter((item) => item.invoice_id === invoice.id)
    const paid = relatedReceipts.reduce((sum, item) => sum + Number(item.amount_received || 0), 0)
    const amount = Number(invoice.amount || 0)
    const balance = Math.max(0, amount - paid)
    const notes = String(invoice.notes || '')
    const description = notes.split('\n').filter((line) => !/^(Payment terms:|Bank:|Account name:|Account number:|70% deposit due:)/i.test(line.trim())).join('\n').trim()
    const paymentTerms = notes.split('\n').filter((line) => /^Payment terms:/i.test(line.trim())).map((line) => line.replace(/^Payment terms:\s*/i, '')).join('\n') || settings.default_invoice_payment_terms || 'Please pay by the due date shown.'
    const deposit = String(invoice.deposit_option || '').toLowerCase().includes('deposit')
    const depositAmount = Number(invoice.deposit_amount || (deposit ? amount * .7 : amount))
    const body = `<div class="doc-head"><div><h1 class="doc-title">INVOICE</h1><div class="ref">${safe(invoice.invoice_ref || 'Invoice')}</div><p class="small">Payment request for the service listed below</p></div><div class="meta"><div><span>Issue date</span><span>${safe(formatDate(invoice.issue_date))}</span></div><div><span>Due date</span><span>${safe(formatDate(invoice.due_date))}</span></div><div><span>Booking ref.</span><span>${safe(booking?.booking_ref || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Bill to</div><p><strong>${safe(invoice.customer_name || 'Customer')}</strong></p><p>${safe(booking?.phone || '')}</p><p>${safe(booking?.email || '')}</p><p>${safe(booking?.address || '')}</p></section><section class="details"><div class="block-title">Service</div><p><strong>${safe(booking?.service || description.split('\n')[0] || 'Professional service')}</strong></p><p>${safe(booking?.property_type || '')}</p><p>${safe(booking?.preferred_date ? formatDate(booking.preferred_date) : '')}</p></section></div><section class="section"><h3>Invoice summary</h3><div class="details description">${safe(description || 'Service as agreed with the customer.')}</div><div class="total"><div><span>Invoice total</span><strong>${safe(formatMoney(amount))}</strong></div><div><span>Paid to date</span><strong>${safe(formatMoney(paid))}</strong></div><div class="subtle"><span>Balance outstanding</span><strong>${safe(formatMoney(balance))}</strong></div><div class="grand"><span>${deposit ? '70% deposit due' : 'Amount due'}</span><span>${safe(formatMoney(deposit ? Math.max(0, depositAmount - paid) : balance))}</span></div></div></section><div class="columns"><section class="callout"><h3>Payment terms</h3><p>${safe(paymentTerms)}</p>${deposit ? `<p><strong>Deposit:</strong> ${safe(formatMoney(depositAmount))}</p><p><strong>Balance after deposit:</strong> ${safe(formatMoney(Math.max(0, amount-depositAmount)))}</p>` : ''}</section><section class="callout"><h3>Bank transfer details</h3><p><strong>Bank:</strong> ${safe(settings.bank_name || 'Add bank details in Business Settings')}</p><p><strong>Account name:</strong> ${safe(settings.account_name || 'Not set')}</p><p><strong>Account number:</strong> ${safe(settings.account_number || 'Not set')}</p><p><strong>Payment reference:</strong> ${safe(invoice.invoice_ref || '—')}</p></section></div><p><span class="status">${safe(balance <= 0 ? 'Paid in full' : paid > 0 ? 'Part payment received' : 'Awaiting payment')}</span></p>`
    printDocument(invoice.invoice_ref || 'Invoice', body)
  }

  function printReceipt(receipt) {
    const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const invoice = invoices.find((item) => item.id === receipt.invoice_id)
    const relatedReceipts = receipts.filter((item) => item.invoice_id === receipt.invoice_id)
    const paidBefore = relatedReceipts.filter((item) => item.id !== receipt.id).reduce((sum, item) => sum + Number(item.amount_received || 0), 0)
    const paidToDate = paidBefore + Number(receipt.amount_received || 0)
    const invoiceTotal = Number(invoice?.amount || 0)
    const balance = Math.max(0, invoiceTotal - paidToDate)
    const paymentStatus = invoiceTotal > 0 && balance <= 0 ? 'Paid in full' : 'Part payment'
    const booking = bookings.find((item) => item.id === (receipt.booking_id || invoice?.booking_id))
    const body = `<div class="doc-head"><div><h1 class="doc-title">PAYMENT RECEIPT</h1><div class="ref">${safe(receipt.receipt_ref || 'Receipt')}</div><p class="small">Confirmation of payment received</p></div><div class="meta"><div><span>Payment date</span><span>${safe(formatDate(receipt.payment_date))}</span></div><div><span>Invoice no.</span><span>${safe(receipt.invoice_ref || invoice?.invoice_ref || '—')}</span></div><div><span>Booking ref.</span><span>${safe(booking?.booking_ref || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Received from</div><p><strong>${safe(receipt.customer_name || invoice?.customer_name || 'Customer')}</strong></p><p>${safe(booking?.phone || '')}</p><p>${safe(booking?.email || '')}</p><p>${safe(booking?.address || '')}</p></section><section class="details"><div class="block-title">Payment details</div><p><strong>Method:</strong> ${safe(String(receipt.payment_method || '—').replaceAll('_',' '))}</p><p><strong>Transaction ref.:</strong> ${safe(receipt.payment_reference || '—')}</p><p><strong>Service:</strong> ${safe(booking?.service || 'Service linked to invoice')}</p></section></div><section class="section"><h3>Payment summary</h3><div class="total" style="width:100%;max-width:none;margin-top:0"><div><span>Invoice total</span><strong>${safe(formatMoney(invoiceTotal))}</strong></div><div><span>Previously paid</span><strong>${safe(formatMoney(paidBefore))}</strong></div><div class="grand"><span>Payment received this time</span><span>${safe(formatMoney(receipt.amount_received))}</span></div><div><span>Total paid to date</span><strong>${safe(formatMoney(paidToDate))}</strong></div><div class="subtle"><span>Remaining balance</span><strong>${safe(formatMoney(balance))}</strong></div></div></section><div class="columns"><section class="callout"><h3>Payment status</h3><p><span class="status">${paymentStatus}</span></p><p>${balance > 0 ? `This receipt confirms the payment shown above. Outstanding balance: ${safe(formatMoney(balance))}.` : 'The invoice balance has been fully settled.'}</p></section><section class="callout"><h3>Notes</h3><p>${safe(receipt.notes || 'Thank you for your payment. We appreciate your business.')}</p></section></div><p class="small">This receipt confirms only the payment amount recorded above. Keep it for your records.</p>`
    printDocument(receipt.receipt_ref || 'Payment Receipt', body)
  }

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
    setPermissionSaving((current) => ({ ...current, [staffId]: true }))
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
        view_quotes: permissions.view_quotes || permissions.manage_quotes,
        manage_quotes: permissions.manage_quotes,
        view_receipts: permissions.view_receipts || permissions.manage_receipts,
        manage_receipts: permissions.manage_receipts,
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
          view_quotes: record.view_quotes,
          manage_quotes: record.manage_quotes,
          view_receipts: record.view_receipts,
          manage_receipts: record.manage_receipts,
        },
      }))

      setPermissionMessage('Staff permissions saved successfully.')
    } catch (err) {
      setPermissionMessage(`Could not save permissions: ${err.message}`)
    } finally {
      setPermissionSaving((current) => ({ ...current, [staffId]: false }))
    }
  }

  function updateStaffForm(field, value) {
    setStaffForm((current) => ({ ...current, [field]: value }))
  }

  async function callStaffFunction(body) {
    const { data, error: functionError } = await supabase.functions.invoke('manage-staff', { body })
    if (functionError) {
      let message = functionError.message || 'Staff management request failed.'
      try {
        const context = functionError.context
        if (context && typeof context.json === 'function') {
          const details = await context.json()
          if (details?.error) message = details.error
        }
      } catch (_) {}
      throw new Error(message)
    }
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function handleCreateStaff(event) {
    event.preventDefault()
    setPermissionMessage('')
    setError('')
    setSuccess('')
    setCreatingStaff(true)
    try {
      const permissions = {
        view_bookings: Boolean(staffForm.view_bookings || staffForm.manage_bookings),
        manage_bookings: Boolean(staffForm.manage_bookings),
        view_invoices: Boolean(staffForm.view_invoices || staffForm.manage_invoices),
        manage_invoices: Boolean(staffForm.manage_invoices),
        view_quotes: Boolean(staffForm.view_quotes || staffForm.manage_quotes),
        manage_quotes: Boolean(staffForm.manage_quotes),
        view_receipts: Boolean(staffForm.view_receipts || staffForm.manage_receipts),
        manage_receipts: Boolean(staffForm.manage_receipts),
      }
      await callStaffFunction({
        action: 'create',
        full_name: staffForm.full_name.trim(),
        email: staffForm.email.trim().toLowerCase(),
        password: staffForm.password,
        permissions,
      })
      setStaffForm({ full_name: '', email: '', password: '', ...emptyPermissions })
      setPermissionMessage('Staff account created successfully. Share the temporary password securely and ask the staff member to change it after signing in.')
      await loadDashboard()
    } catch (err) {
      setPermissionMessage(`Could not create staff account: ${err.message}`)
    } finally {
      setCreatingStaff(false)
    }
  }

  async function handleStaffActive(member) {
    if (member.role === 'admin') return
    const nextActive = !member.is_active
    const actionLabel = nextActive ? 'reactivate' : 'deactivate'
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${member.full_name || member.email}?`)) return
    setStaffActionBusy((current) => ({ ...current, [member.id]: true }))
    setPermissionMessage('')
    try {
      await callStaffFunction({ action: 'set_active', user_id: member.id, is_active: nextActive })
      setPermissionMessage(`Staff account ${nextActive ? 'reactivated' : 'deactivated'} successfully.`)
      await loadDashboard()
    } catch (err) {
      setPermissionMessage(`Could not ${actionLabel} account: ${err.message}`)
    } finally {
      setStaffActionBusy((current) => ({ ...current, [member.id]: false }))
    }
  }

  async function handleResetStaffPassword(member) {
    const password = String(staffResetPasswords[member.id] || '')
    if (password.length < 8) {
      setPermissionMessage('Enter a temporary password with at least 8 characters before resetting.')
      return
    }
    if (!window.confirm(`Reset the password for ${member.full_name || member.email}?`)) return
    setStaffActionBusy((current) => ({ ...current, [member.id]: true }))
    setPermissionMessage('')
    try {
      await callStaffFunction({ action: 'reset_password', user_id: member.id, password })
      setStaffResetPasswords((current) => ({ ...current, [member.id]: '' }))
      setPermissionMessage(`Temporary password reset for ${member.full_name || member.email}. Share it securely and ask them to change it after signing in.`)
    } catch (err) {
      setPermissionMessage(`Could not reset password: ${err.message}`)
    } finally {
      setStaffActionBusy((current) => ({ ...current, [member.id]: false }))
    }
  }

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }))
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

  function selectBookingForQuote(booking) {
    setQuoteForm((current) => ({
      ...current,
      booking_id: booking.id,
      customer_name: booking.customer_name || '',
      customer_phone: booking.phone || '',
      customer_email: booking.email || '',
      service_description: [booking.service, booking.property_type].filter(Boolean).join(' — '),
    }))
    setShowQuoteForm(true)
    setActiveSection('quotes')
    setSuccess('')
    setError('')
  }

  function selectBookingForInvoice(booking) {
    setInvoiceForm((current) => ({
      ...current,
      booking_id: booking.id,
      customer_name: booking.customer_name || '',
      description: [booking.service, booking.property_type]
        .filter(Boolean)
        .join(' — '),
      notes: settings.default_invoice_notes || '',
      payment_terms: settings.default_invoice_payment_terms || '',
    }))
    setShowInvoiceForm(true)
    setActiveSection('invoices')
    setSuccess('')
    setError('')
  }

  async function handleCreateInvoice(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
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
        deposit_option: invoiceForm.payment_option === 'deposit' ? 'deposit' : 'full_payment',
        deposit_amount: depositAmount,
        issue_date: invoiceForm.issue_date || null,
        due_date: invoiceForm.due_date || null,
        notes: [
          invoiceForm.description.trim(),
          (invoiceForm.payment_terms || settings.default_invoice_payment_terms).trim() ? `Payment terms: ${(invoiceForm.payment_terms || settings.default_invoice_payment_terms).trim()}` : '',
          invoiceForm.notes.trim(),
          invoiceForm.payment_option === 'deposit'
            ? `70% deposit due: ${formatMoney(depositAmount)}. Balance: ${formatMoney(amount - depositAmount)}.`
            : '',
          settings.bank_name.trim() ? `Bank: ${settings.bank_name.trim()}` : '',
          settings.account_name.trim() ? `Account name: ${settings.account_name.trim()}` : '',
          settings.account_number.trim() ? `Account number: ${settings.account_number.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      }

      const { error: insertError } = await supabase
        .from('invoices')
        .insert(invoicePayload)

      if (insertError) throw insertError

      setInvoiceForm({ ...emptyInvoiceForm })
      setShowInvoiceForm(false)
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

    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)

      if (updateError) throw updateError

      setSuccess(`Invoice marked ${status}.`)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update invoice status.')
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'quotes', label: 'Quotes', icon: ClipboardList },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: FileText },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ]

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
            activeSection === 'bookings' &&
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
                background: active ? '#EEF7FA' : '#fff',
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
      return <p style={{ color: MUTED, fontSize: 13 }}>No bookings match your search.</p>
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Reference', 'Customer', 'Service / Property', 'Preferred date', 'Status', 'Actions'].map((heading) => (
                <th key={heading} style={thStyle}>{heading}</th>
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
                    <div style={{ color: MUTED, fontSize: 12 }}>{booking.phone || '—'}</div>
                    {booking.email && (
                      <div style={{ color: MUTED, fontSize: 12 }}>{booking.email}</div>
                    )}
                    {booking.address && (
                      <div style={{ color: MUTED, fontSize: 12, marginTop: 3 }}>{booking.address}</div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {booking.service || '—'}
                    {booking.property_type && (
                      <div style={{ color: MUTED, fontSize: 12 }}>{booking.property_type}</div>
                    )}
                    {booking.notes && (
                      <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{booking.notes}</div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {formatDate(booking.preferred_date)}
                    {booking.preferred_time && (
                      <div style={{ color: MUTED, fontSize: 12 }}>{booking.preferred_time}</div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <select
                      aria-label={`Status for ${booking.booking_ref || booking.customer_name}`}
                      value={normalizeStatus(booking.status)}
                      onChange={(event) => updateBookingStatus(booking.id, event.target.value)}
                      style={{ ...inputStyle, minWidth: 120, padding: '6px 8px', fontSize: 12 }}
                    >
                      {BOOKING_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button type="button" aria-label={`Actions for ${booking.booking_ref || booking.customer_name}`} onClick={() => setOpenBookingMenu((current) => current === booking.id ? '' : booking.id)} style={{ ...buttonStyle, background: '#fff', color: DARK, borderColor: BORDER, minHeight: 34, padding: '6px 9px' }}>
                        <MoreVertical size={17} /> Actions
                      </button>
                      {openBookingMenu === booking.id && <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 5px)', zIndex: 20, width: 180, padding: 5, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, boxShadow: '0 8px 24px #14243A20', display: 'grid', gap: 3 }}>
                        <button type="button" onClick={() => { setOpenBookingMenu(''); selectBookingForQuote(booking) }} style={{ ...menuButtonStyle }}><FileText size={14} /> Create Quote</button>
                        <button type="button" onClick={() => { setOpenBookingMenu(''); selectBookingForInvoice(booking) }} style={{ ...menuButtonStyle }}><FileText size={14} /> Create Invoice</button>
                        {chatUrl && <a href={chatUrl} target="_blank" rel="noreferrer" onClick={() => setOpenBookingMenu('')} style={{ ...menuButtonStyle, textDecoration: 'none' }}><MessageCircle size={14} /> Send Message (WhatsApp)</a>}
                      </div>}
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
          <p>Loading your admin dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F5F8FC',
        color: DARK,
        padding: '20px 0 42px',
      }}
    >
      <div style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto' }}>
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
            <p style={{ color: GREEN, fontWeight: 700, fontSize: 11, letterSpacing: 1, margin: '0 0 3px' }}>
              OPET REALMS
            </p>
            <h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.3 }}>Admin Dashboard</h1>
            <p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>
              Welcome back, {staffName}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={buttonStyle} onClick={loadDashboard}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button type="button" style={{ ...buttonStyle, background: DARK }} onClick={handleSignOut}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </header>

        <nav
          aria-label="Admin sections"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}
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

        {error && (
          <div role="alert" style={{ ...panelStyle, color: '#9f2424', borderColor: '#f0c7c7', background: '#fff8f8', fontSize: 13 }}>
            {error}
          </div>
        )}

        {success && (
          <div role="status" style={{ ...panelStyle, color: '#065f46', borderColor: '#b9e3cf', background: '#f1fbf5', fontSize: 13 }}>
            {success}
          </div>
        )}

        {activeSection === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Total bookings', value: bookings.length, icon: CalendarDays },
                { label: 'Total quotes', value: quotes.length, icon: ClipboardList },
                { label: 'Total invoices', value: invoices.length, icon: FileText },
                { label: 'Receipts issued', value: receipts.length, icon: FileText },
                { label: 'Staff profiles', value: team.length, icon: Users },
                { label: 'Unpaid invoices', value: invoices.filter((invoice) => !['paid', 'completed'].includes(String(invoice.status || '').toLowerCase())).length, icon: ShieldCheck },
              ].map((card) => {
                const Icon = card.icon
                return (
                  <section key={card.label} style={{ ...panelStyle, marginBottom: 0 }}>
                    <Icon size={21} color={GREEN} />
                    <p style={{ color: MUTED, margin: '8px 0 3px', fontSize: 12 }}>{card.label}</p>
                    <strong style={{ fontSize: 26, lineHeight: 1.2 }}>{card.value}</strong>
                  </section>
                )
              })}
            </div>

            <section style={panelStyle}>
              <SectionHeading description="Select a stage to open bookings at that point in the workflow.">
                Booking stages
              </SectionHeading>
              {renderBookingStatusCards()}
            </section>


          </>
        )}

        {activeSection === 'bookings' && (
          <>
            <section style={panelStyle}>
              <SectionHeading description="Choose a stage to filter bookings.">
                Booking stages
              </SectionHeading>
              {renderBookingStatusCards()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: 12 }}>
                <label style={labelStyle}>
                  Filter by status
                  <select
                    style={inputStyle}
                    value={bookingStatusFilter}
                    onChange={(event) => setBookingStatusFilter(event.target.value)}
                  >
                    <option value="all">All bookings ({bookings.length})</option>
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
                    <Search size={16} style={{ position: 'absolute', top: 12, left: 11, color: MUTED }} />
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

            <section style={panelStyle}>
              <SectionHeading
                description="Add a booking received by phone, WhatsApp, or another channel."
                action={
                  <button type="button" style={buttonStyle} onClick={() => setShowBookingForm((value) => !value)}>
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
                        onChange={(event) => setBookingForm({ ...bookingForm, customer_name: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Phone *
                      <input
                        style={inputStyle}
                        required
                        value={bookingForm.phone}
                        onChange={(event) => setBookingForm({ ...bookingForm, phone: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Email
                      <input
                        type="email"
                        style={inputStyle}
                        value={bookingForm.email}
                        onChange={(event) => setBookingForm({ ...bookingForm, email: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Service *
                      <input
                        style={inputStyle}
                        required
                        placeholder="e.g. Deep Cleaning"
                        value={bookingForm.service}
                        onChange={(event) => setBookingForm({ ...bookingForm, service: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Property type / size
                      <input
                        style={inputStyle}
                        placeholder="e.g. 4-bedroom duplex"
                        value={bookingForm.property_type}
                        onChange={(event) => setBookingForm({ ...bookingForm, property_type: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Preferred date
                      <input
                        type="date"
                        style={inputStyle}
                        value={bookingForm.preferred_date}
                        onChange={(event) => setBookingForm({ ...bookingForm, preferred_date: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Preferred time
                      <input
                        style={inputStyle}
                        placeholder="e.g. 10:00 AM"
                        value={bookingForm.preferred_time}
                        onChange={(event) => setBookingForm({ ...bookingForm, preferred_time: event.target.value })}
                      />
                    </label>

                    <label style={labelStyle}>
                      Address / area *
                      <input
                        style={inputStyle}
                        required
                        placeholder="Customer's service address"
                        value={bookingForm.address}
                        onChange={(event) => setBookingForm({ ...bookingForm, address: event.target.value })}
                      />
                    </label>
                  </div>

                  <label style={{ ...labelStyle, marginTop: 14 }}>
                    Notes
                    <textarea
                      style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm({ ...bookingForm, notes: event.target.value })}
                    />
                  </label>

                  <button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={savingBooking}>
                    {savingBooking ? <LoaderCircle size={15} /> : <Plus size={15} />}
                    {savingBooking ? 'Creating booking...' : 'Save booking'}
                  </button>
                </form>
              )}
            </section>

            <section style={panelStyle}>
              <SectionHeading description={`${filteredBookings.length} booking(s) found.`}>
                All bookings
              </SectionHeading>
              {renderBookingsTable(filteredBookings)}
            </section>
          </>
        )}

        {activeSection === 'invoices' && (
          <>
            <section style={panelStyle}>
              <SectionHeading description="Your invoice list appears first. Open the form only when you need to create an invoice." action={<button type="button" style={buttonStyle} onClick={() => setShowInvoiceForm((v) => !v)}>{showInvoiceForm ? 'Close form' : 'Create invoice'}</button>}>
                Invoices
              </SectionHeading>

              {showInvoiceForm && <form onSubmit={handleCreateInvoice}>
                <div style={formGridStyle}>
                  <label style={labelStyle}>
                    Link to booking (optional)
                    <select
                      style={inputStyle}
                      value={invoiceForm.booking_id}
                      onChange={(event) => {
                        const selected = bookings.find((booking) => booking.id === event.target.value)
                        setInvoiceForm({
                          ...invoiceForm,
                          booking_id: event.target.value,
                          customer_name: selected?.customer_name || invoiceForm.customer_name,
                          description: selected
                            ? [selected.service, selected.property_type].filter(Boolean).join(' — ')
                            : invoiceForm.description,
                        })
                      }}
                    >
                      <option value="">No linked booking / manual invoice</option>
                      {bookings.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {(booking.booking_ref || 'Booking')} — {booking.customer_name || 'Customer'}
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
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, customer_name: event.target.value })}
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
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, amount: event.target.value })}
                    />
                  </label>

                  <label style={labelStyle}>
                    Payment option
                    <select
                      style={inputStyle}
                      value={invoiceForm.payment_option}
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, payment_option: event.target.value })}
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
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, issue_date: event.target.value })}
                    />
                  </label>

                  <label style={labelStyle}>
                    Due date
                    <input
                      type="date"
                      style={inputStyle}
                      value={invoiceForm.due_date}
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, due_date: event.target.value })}
                    />
                  </label>

                  <label style={labelStyle}>
                    Service / description
                    <input
                      style={inputStyle}
                      placeholder="e.g. Deep cleaning — 4-bedroom flat"
                      value={invoiceForm.description}
                      onChange={(event) => setInvoiceForm({ ...invoiceForm, description: event.target.value })}
                    />
                  </label>
                </div>

                {invoiceForm.payment_option === 'deposit' && Number(invoiceForm.amount) > 0 && (
                  <div style={{ background: '#EEF7FA', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginTop: 14, fontSize: 13 }}>
                    <strong>70% deposit:</strong> {formatMoney(Number(invoiceForm.amount) * 0.7)}
                    <span style={{ margin: '0 12px', color: MUTED }}>·</span>
                    <strong>Remaining balance:</strong> {formatMoney(Number(invoiceForm.amount) * 0.3)}
                  </div>
                )}

                <label style={{ ...labelStyle, marginTop: 14 }}>
                  Additional invoice notes
                  <textarea
                    style={{ ...inputStyle, minHeight: 75, resize: 'vertical' }}
                    value={invoiceForm.notes}
                    onChange={(event) => setInvoiceForm({ ...invoiceForm, notes: event.target.value })}
                    placeholder="Additional payment instructions or notes"
                  />
                </label>

                <div style={{ background: '#F5F8FC', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 13, marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
                  <strong>Bank transfer details</strong>
                  <div>{settings.bank_name || 'Add bank name in Business Settings'}</div>
                  <div>Account name: {settings.account_name || 'Not set'}</div>
                  <div>Account number: {settings.account_number || 'Not set'}</div>
                  <label style={{ ...labelStyle, marginTop: 12 }}>Payment terms (shown on invoice)
                    <textarea style={{ ...inputStyle, minHeight: 75, resize: 'vertical' }} value={invoiceForm.payment_terms} onChange={(event) => setInvoiceForm({ ...invoiceForm, payment_terms: event.target.value })} placeholder={settings.default_invoice_payment_terms || 'Add invoice payment terms in Business Settings'} />
                  </label>
                </div>

                <button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={savingInvoice}>
                  {savingInvoice ? <LoaderCircle size={15} /> : <Save size={15} />}
                  {savingInvoice ? 'Creating invoice...' : 'Create invoice'}
                </button>
              </form>}
            </section>

            <section style={panelStyle}>
              <SectionHeading description="Search invoices and print or save each invoice as a PDF.">
                Invoices & receipts
              </SectionHeading>

              <label style={{ ...labelStyle, marginBottom: 14, maxWidth: 420 }}>
                Search invoices
                <input
                  style={inputStyle}
                  value={invoiceSearch}
                  onChange={(event) => setInvoiceSearch(event.target.value)}
                  placeholder="Invoice reference or customer name"
                />
              </label>

              {filteredInvoices.length === 0 ? (
                <p style={{ color: MUTED, fontSize: 13 }}>No invoices found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {['Invoice', 'Customer', 'Amount', 'Issue date', 'Due date', 'Status', 'Actions'].map((heading) => (
                          <th key={heading} style={thStyle}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td style={tdStyle}>
                            <strong>{invoice.invoice_ref || '—'}</strong>
                            {invoice.booking_id && (
                              <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>Booking linked</div>
                            )}
                          </td>
                          <td style={tdStyle}>{invoice.customer_name || '—'}</td>
                          <td style={tdStyle}>{formatMoney(invoice.amount)}</td>
                          <td style={tdStyle}>{formatDate(invoice.issue_date)}</td>
                          <td style={tdStyle}>{formatDate(invoice.due_date)}</td>
                          <td style={tdStyle}><StatusPill status={invoice.status || 'unpaid'} /></td>
                          <td style={tdStyle}>
                            <select
                              aria-label={`Payment status for ${invoice.invoice_ref || invoice.customer_name}`}
                              value={['draft','sent','unpaid','paid','cancelled'].includes(String(invoice.status || '').toLowerCase()) ? String(invoice.status).toLowerCase() : 'unpaid'}
                              onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value)}
                              style={{ ...inputStyle, minWidth: 110, padding: '6px 8px', fontSize: 12 }}
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button type="button" style={{ ...buttonStyle, minHeight: 32, marginTop: 6 }} onClick={() => printInvoice(invoice)}>Download / Print PDF</button>
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

        {activeSection === 'quotes' && (
          <>
            <section style={panelStyle}>
              <SectionHeading description="Review existing quotations first. Open the form only when you need a new quotation." action={<button type="button" style={buttonStyle} onClick={() => setShowQuoteForm((v) => !v)}>{showQuoteForm ? 'Close form' : 'Create quote'}</button>}>Quotes</SectionHeading>
              {showQuoteForm && <form onSubmit={handleCreateQuote}>
                <div style={formGridStyle}>
                  <label style={labelStyle}>Link booking *<select required style={inputStyle} value={quoteForm.booking_id} onChange={(event) => { const b = bookings.find((item) => item.id === event.target.value); setQuoteForm({ ...quoteForm, booking_id: event.target.value, customer_name: b?.customer_name || quoteForm.customer_name, customer_phone: b?.phone || quoteForm.customer_phone, customer_email: b?.email || quoteForm.customer_email, service_description: b ? [b.service, b.property_type].filter(Boolean).join(' — ') : quoteForm.service_description }) }}><option value="">Select a booking</option>{bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_ref || 'Booking'} — {b.customer_name}</option>)}</select></label>
                  <label style={labelStyle}>Customer name *<input style={inputStyle} required value={quoteForm.customer_name} onChange={(e) => setQuoteForm({ ...quoteForm, customer_name: e.target.value })} /></label>
                  <label style={labelStyle}>Customer phone<input style={inputStyle} value={quoteForm.customer_phone} onChange={(e) => setQuoteForm({ ...quoteForm, customer_phone: e.target.value })} /></label>
                  <label style={labelStyle}>Customer email<input type="email" style={inputStyle} value={quoteForm.customer_email} onChange={(e) => setQuoteForm({ ...quoteForm, customer_email: e.target.value })} /></label>
                  <label style={labelStyle}>Quotation amount (₦) *<input type="number" min="0" step="0.01" required style={inputStyle} value={quoteForm.amount} onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })} /></label>
                  <label style={labelStyle}>Valid until<input type="date" style={inputStyle} value={quoteForm.valid_until} onChange={(e) => setQuoteForm({ ...quoteForm, valid_until: e.target.value })} /></label>
                </div>
                <label style={{ ...labelStyle, marginTop: 14 }}>Service description *<textarea required style={{ ...inputStyle, minHeight: 75 }} value={quoteForm.service_description} onChange={(e) => setQuoteForm({ ...quoteForm, service_description: e.target.value })} /></label>
                <p style={{ color: MUTED, fontSize: 12, marginTop: 12 }}>Payment terms and bank details will appear on the invoice, not on this quotation.</p>
                <label style={{ ...labelStyle, marginTop: 14 }}>Notes<textarea style={{ ...inputStyle, minHeight: 65 }} value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} /></label>
                <button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={savingQuote}>{savingQuote ? 'Saving quotation...' : 'Save quotation'}</button>
              </form>}
            </section>
            <section style={panelStyle}><SectionHeading description="Update the quote status and download a saved quotation.">All quotations</SectionHeading><label style={{ ...labelStyle, maxWidth: 420, marginBottom: 14 }}>Search quotations<input style={inputStyle} value={quoteSearch} onChange={(e) => setQuoteSearch(e.target.value)} placeholder="Reference, customer or service" /></label>
              {filteredQuotes.length ? <div style={{ overflowX: 'auto' }}><table style={tableStyle}><thead><tr>{['Reference','Customer','Description','Amount','Valid until','Status','Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{filteredQuotes.map((q) => <tr key={q.id}><td style={tdStyle}><strong>{q.quote_ref}</strong></td><td style={tdStyle}>{q.customer_name}</td><td style={tdStyle}>{q.service_description}</td><td style={tdStyle}>{formatMoney(q.amount)}</td><td style={tdStyle}>{formatDate(q.valid_until)}</td><td style={tdStyle}><StatusPill status={q.status} /></td><td style={tdStyle}><div style={{ display: 'grid', gap: 6 }}><select style={{ ...inputStyle, minWidth: 120, padding: '6px 8px' }} value={q.status} onChange={(e) => updateQuoteStatus(q.id, e.target.value)}>{['draft','sent','accepted','declined','expired','cancelled'].map((st) => <option key={st} value={st}>{st[0].toUpperCase()+st.slice(1)}</option>)}</select><button type="button" style={{ ...buttonStyle, minHeight: 32 }} onClick={() => printQuote(q)}>Print / Save PDF</button></div></td></tr>)}</tbody></table></div> : <p style={{ color: MUTED, fontSize: 13 }}>No quotations found.</p>}
            </section>
          </>
        )}

        {activeSection === 'receipts' && (
          <>
            <section style={panelStyle}><SectionHeading description="Existing receipts appear below. Record a payment only after it has been verified." action={<button type="button" style={buttonStyle} onClick={() => setShowReceiptForm((v) => !v)}>{showReceiptForm ? 'Close form' : 'Record payment'}</button>}>Receipts</SectionHeading>
              {showReceiptForm && <form onSubmit={handleCreateReceipt}><div style={formGridStyle}>
                <label style={labelStyle}>Invoice *<select required style={inputStyle} value={receiptForm.invoice_id} onChange={(e) => { const inv = invoices.find((item) => item.id === e.target.value); setReceiptForm({ ...receiptForm, invoice_id: e.target.value, amount_received: inv ? String(Math.max(0, Number(inv.amount || 0) - receipts.filter((r) => r.invoice_id === inv.id).reduce((sum, r) => sum + Number(r.amount_received || 0), 0))) : receiptForm.amount_received }) }}><option value="">Select invoice</option>{invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').map((i) => <option key={i.id} value={i.id}>{i.invoice_ref} — {i.customer_name} ({formatMoney(i.amount)})</option>)}</select></label>
                <label style={labelStyle}>Amount received (₦) *<input type="number" required min="0.01" step="0.01" style={inputStyle} value={receiptForm.amount_received} onChange={(e) => setReceiptForm({ ...receiptForm, amount_received: e.target.value })} /></label>
                <label style={labelStyle}>Payment date<input type="date" style={inputStyle} value={receiptForm.payment_date} onChange={(e) => setReceiptForm({ ...receiptForm, payment_date: e.target.value })} /></label>
                <label style={labelStyle}>Payment method<select style={inputStyle} value={receiptForm.payment_method} onChange={(e) => setReceiptForm({ ...receiptForm, payment_method: e.target.value })}>{['bank_transfer','cash','card','other'].map((m) => <option key={m} value={m}>{m.replace('_',' ').replace(/^./, c => c.toUpperCase())}</option>)}</select></label>
                <label style={labelStyle}>Payment reference<input style={inputStyle} value={receiptForm.payment_reference} onChange={(e) => setReceiptForm({ ...receiptForm, payment_reference: e.target.value })} placeholder="Bank transaction reference" /></label>
              </div><label style={{ ...labelStyle, marginTop: 14 }}>Notes<textarea style={{ ...inputStyle, minHeight: 65 }} value={receiptForm.notes} onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })} /></label><button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={savingReceipt}>{savingReceipt ? 'Recording payment...' : 'Record payment and create receipt'}</button></form>}
            </section>
            <section style={panelStyle}><SectionHeading description="Receipts are payment records and should not be created until payment is confirmed.">Receipt history</SectionHeading><label style={{ ...labelStyle, maxWidth: 420, marginBottom: 14 }}>Search receipts<input style={inputStyle} value={receiptSearch} onChange={(e) => setReceiptSearch(e.target.value)} placeholder="Receipt reference, customer or payment ref" /></label>
              {filteredReceipts.length ? <div style={{ overflowX: 'auto' }}><table style={tableStyle}><thead><tr>{['Receipt','Customer','Invoice','Amount received','Date','Method','Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead><tbody>{filteredReceipts.map((r) => { const inv = invoices.find((i) => i.id === r.invoice_id); return <tr key={r.id}><td style={tdStyle}><strong>{r.receipt_ref}</strong></td><td style={tdStyle}>{r.customer_name}</td><td style={tdStyle}>{inv?.invoice_ref || '—'}</td><td style={tdStyle}>{formatMoney(r.amount_received)}</td><td style={tdStyle}>{formatDate(r.payment_date)}</td><td style={tdStyle}>{String(r.payment_method || '').replace('_',' ')}</td><td style={tdStyle}><button type="button" style={{ ...buttonStyle, minHeight: 32 }} onClick={() => printReceipt({ ...r, invoice_ref: inv?.invoice_ref })}>Print / Save PDF</button></td></tr> })}</tbody></table></div> : <p style={{ color: MUTED, fontSize: 13 }}>No receipts recorded yet.</p>}
            </section>
          </>
        )}

        {activeSection === 'staff' && (
          <section>
            <section style={panelStyle}>
              <SectionHeading description="Create staff logins, set permissions, reset temporary passwords, and deactivate access.">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <ShieldCheck size={18} color={GREEN} /> Staff Management
                </span>
              </SectionHeading>

              {permissionMessage && (
                <p role="status" style={{ color: permissionMessage.startsWith('Could not') ? '#9f2424' : GREEN, background: permissionMessage.startsWith('Could not') ? '#fff1f1' : '#EEF7FA', padding: 11, borderRadius: 8, fontSize: 13, overflowWrap: 'anywhere' }}>
                  {permissionMessage}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: DARK }}>Staff accounts</h3>
                <button type="button" style={buttonStyle} onClick={() => setShowCreateStaffForm((v) => !v)}>{showCreateStaffForm ? 'Close form' : 'Create staff'}</button>
              </div>
              {showCreateStaffForm && <>
              <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>
                Use a real email address as the staff username. The temporary password is sent securely to Supabase Auth and is not saved in your database.
              </p>
              <form onSubmit={handleCreateStaff}>
                <div style={formGridStyle}>
                  <label style={labelStyle}>Full name
                    <input style={inputStyle} value={staffForm.full_name} onChange={(event) => updateStaffForm('full_name', event.target.value)} required maxLength={120} placeholder="Staff member name" />
                  </label>
                  <label style={labelStyle}>Email / username
                    <input style={inputStyle} type="email" autoComplete="off" value={staffForm.email} onChange={(event) => updateStaffForm('email', event.target.value)} required maxLength={254} placeholder="staff@example.com" />
                  </label>
                  <label style={labelStyle}>Temporary password
                    <input style={inputStyle} type="password" autoComplete="new-password" minLength={8} value={staffForm.password} onChange={(event) => updateStaffForm('password', event.target.value)} required placeholder="At least 8 characters" />
                  </label>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: 13, marginTop: 14 }}>
                  <strong style={{ display: 'block', fontSize: 13, marginBottom: 10 }}>Permissions</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                    {[
                      ['view_bookings', 'View bookings'],
                      ['manage_bookings', 'Manage bookings'],
                      ['view_invoices', 'View invoices'],
                      ['manage_invoices', 'Manage invoices'],
                      ['view_quotes', 'View quotes'],
                      ['manage_quotes', 'Manage quotes'],
                      ['view_receipts', 'View receipts'],
                      ['manage_receipts', 'Manage receipts'],
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: DARK }}>
                        <input type="checkbox" checked={Boolean(staffForm[key])} onChange={(event) => updateStaffForm(key, event.target.checked)} /> {label}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={creatingStaff}>
                  {creatingStaff ? <LoaderCircle size={15} /> : <Plus size={15} />}
                  {creatingStaff ? 'Creating account...' : 'Create staff account'}
                </button>
              </form></>}
            </section>

            <section style={panelStyle}>
              <SectionHeading description="Select a staff member to expand their permissions and account controls.">Staff list</SectionHeading>
              {team.length === 0 ? (
                <p style={{ color: MUTED, fontSize: 13 }}>No staff profiles found.</p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {team.map((member) => {
                    const permissions = { ...emptyPermissions, ...staffPermissions[member.id] }
                    const isAdmin = member.role === 'admin'
                    const busy = Boolean(staffActionBusy[member.id])
                    return (
                      <div key={member.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, padding: 14, opacity: member.is_active ? 1 : 0.85 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                          <div>
                            <button type="button" onClick={() => setExpandedStaffPermissions((current) => ({ ...current, [member.id]: !current[member.id] }))} style={{ border: 0, background: 'transparent', padding: 0, color: DARK, fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>{member.full_name || 'Unnamed staff member'} <span style={{ color: MUTED, fontSize: 12 }}>{expandedStaffPermissions[member.id] ? '▲' : '▾'}</span></button>
                            <div style={{ color: MUTED, fontSize: 12, overflowWrap: 'anywhere' }}>{member.email || 'No email'}</div>
                            <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>Created: {formatDate(member.created_at)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 20, background: isAdmin ? '#e8f5ef' : '#f0f2f0', color: isAdmin ? GREEN : DARK }}>{member.role || 'staff'}</span>
                            <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 20, background: member.is_active ? '#dff7e9' : '#fee2e2', color: member.is_active ? '#166534' : '#991b1b' }}>{member.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>

                        {expandedStaffPermissions[member.id] && (isAdmin ? (
                          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>Admin accounts retain full dashboard access. Account controls are disabled for admin accounts.</p>
                        ) : (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 9 }}>
                              {[
                                ['view_bookings', 'View bookings'],
                                ['manage_bookings', 'Manage bookings'],
                                ['view_invoices', 'View invoices'],
                                ['manage_invoices', 'Manage invoices'],
                                ['view_quotes', 'View quotes'],
                                ['manage_quotes', 'Manage quotes'],
                                ['view_receipts', 'View receipts'],
                                ['manage_receipts', 'Manage receipts'],
                              ].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: DARK }}>
                                  <input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => toggleStaffPermission(member.id, key, event.target.checked)} /> {label}
                                </label>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                              <button type="button" style={buttonStyle} disabled={Boolean(permissionSaving[member.id])} onClick={() => saveStaffPermissions(member.id)}>
                                {permissionSaving[member.id] ? <LoaderCircle size={15} /> : <Save size={15} />} Save permissions
                              </button>
                              <button type="button" style={{ ...buttonStyle, background: member.is_active ? '#fff1f1' : '#e8f5ef', color: member.is_active ? '#991b1b' : GREEN, borderColor: member.is_active ? '#fecaca' : '#b9e4ce' }} disabled={busy} onClick={() => handleStaffActive(member)}>
                                {busy ? <LoaderCircle size={15} /> : null}{member.is_active ? 'Deactivate account' : 'Reactivate account'}
                              </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 8, marginTop: 12, alignItems: 'end' }}>
                              <label style={labelStyle}>New temporary password
                                <input style={inputStyle} type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" value={staffResetPasswords[member.id] || ''} onChange={(event) => setStaffResetPasswords((current) => ({ ...current, [member.id]: event.target.value }))} />
                              </label>
                              <button type="button" style={{ ...buttonStyle, background: '#fff', color: DARK, borderColor: BORDER }} disabled={busy || String(staffResetPasswords[member.id] || '').length < 8} onClick={() => handleResetStaffPassword(member)}>
                                {busy ? <LoaderCircle size={15} /> : <ShieldCheck size={15} />} Reset password
                              </button>
                            </div>
                          </>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </section>
        )}

        {activeSection === 'settings' && (
          <section style={panelStyle}>
            <SectionHeading description="Update the business details used by the admin dashboard and invoice workflow.">
              Business Settings
            </SectionHeading>

            {!settingsLoaded && (
              <p style={{ background: '#fff8e8', color: '#854d0e', borderRadius: 8, padding: 12, fontSize: 12 }}>
                Business settings could not be loaded from the database. Check that a row with id = 1 exists in business_settings before saving.
              </p>
            )}

            <form onSubmit={saveBusinessSettings}>
              <div style={formGridStyle}>
                {[
                  ['business_name', 'Business name'],
                  ['phone', 'Business phone'],
                  ['whatsapp_number', 'WhatsApp number'],
                  ['email', 'Business email'],
                  ['address', 'Business address'],
                  ['bank_name', 'Bank name'],
                  ['account_name', 'Account name'],
                  ['account_number', 'Account number'],
                  ['quote_validity_days', 'Quote validity (days)'],
                  ['default_invoice_payment_terms', 'Invoice payment terms'],
                ].map(([field, label]) => (
                  <label key={field} style={labelStyle}>
                    {label}
                    <input
                      style={inputStyle}
                      type={field === 'quote_validity_days' ? 'number' : 'text'}
                      min={field === 'quote_validity_days' ? 1 : undefined}
                      value={settings[field] ?? ''}
                      onChange={(event) => updateSetting(field, event.target.value)}
                    />
                  </label>
                ))}
              </div>

              <label style={{ ...labelStyle, marginTop: 14 }}>
                Default invoice notes
                <textarea
                  style={{ ...inputStyle, minHeight: 85, resize: 'vertical' }}
                  value={settings.default_invoice_notes || ''}
                  onChange={(event) => updateSetting('default_invoice_notes', event.target.value)}
                />
              </label>

              <button type="submit" style={{ ...buttonStyle, marginTop: 14 }} disabled={savingSettings}>
                {savingSettings ? <LoaderCircle size={15} /> : <Save size={15} />}
                {savingSettings ? 'Saving settings...' : 'Save business settings'}
              </button>
            </form>
          </section>
        )}

        <footer style={{ textAlign: 'center', color: MUTED, fontSize: 11, padding: '8px 0' }}>
          Opet Realms · Admin dashboard
        </footer>
      </div>
    </main>
  )
}
