import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, ClipboardList, FileText, ReceiptText, LogOut,
  LayoutDashboard, LoaderCircle, RefreshCw, ShieldCheck, Save, Plus,
  Search, MessageCircle, X, Wallet, MoreVertical,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import MultiServiceBookingFields from '../components/MultiServiceBookingFields'
import './dashboard-responsive.css'

/* ------------------------------------------------------------------ */
/* Design tokens (Opet Realms green and white)                         */
/* ------------------------------------------------------------------ */
const GREEN = '#087f5b'
const DARK = '#17231d'
const MUTED = '#68746d'
const BORDER = '#e2e9e4'
const PAGE = '#f6f9f7'
const SOFT = '#f0faf5'

const BOOKING_STATUSES = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
  { value: 'inspection', label: 'Inspection' }, { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
]
const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired', 'cancelled']
const noPermissions = {
  view_bookings: false, manage_bookings: false,
  view_invoices: false, manage_invoices: false,
  view_quotes: false, manage_quotes: false,
  view_receipts: false, manage_receipts: false,
}
const today = () => new Date().toISOString().slice(0, 10)
const emptyInvoiceForm = { booking_id: '', customer_name: '', amount: '', discount_percent: '0', description: '', issue_date: today(), due_date: '', notes: '', payment_terms: '', payment_option: 'full' }
const emptyQuoteForm = { booking_id: '', customer_name: '', customer_phone: '', customer_email: '', service_description: '', amount: '', valid_until: '', notes: '' }
const emptyReceiptForm = { invoice_id: '', amount_received: '', payment_date: today(), payment_method: 'bank_transfer', payment_reference: '', notes: '', verified: false }

const panel = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 16, minWidth: 0 }
const button = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 39, padding: '9px 13px', border: `1px solid ${GREEN}`, borderRadius: 8, background: GREEN, color: '#fff', fontWeight: 650, fontSize: 13, cursor: 'pointer' }
const ghostButton = { ...button, background: '#fff', color: GREEN, borderColor: BORDER }
const smallButton = { ...button, minHeight: 32, padding: '6px 9px', fontSize: 11 }
const input = { width: '100%', boxSizing: 'border-box', minHeight: 40, padding: '9px 11px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: DARK, font: 'inherit', fontSize: 14 }
const label = { display: 'grid', gap: 5, color: DARK, fontSize: 13, fontWeight: 600, minWidth: 0 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14 }
const table = { width: '100%', minWidth: 650, borderCollapse: 'collapse', fontSize: 13 }
const th = { padding: '11px 12px', textAlign: 'left', color: MUTED, background: PAGE, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', fontWeight: 700 }
const td = { padding: 12, borderBottom: `1px solid ${BORDER}`, verticalAlign: 'top' }
const subText = { color: MUTED, fontSize: 12 }

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function normalizeStatus(status) {
  const value = String(status || 'new').trim().toLowerCase()
  return ({ pending: 'contacted', confirmed: 'booked' })[value] || value
}
function formatStatus(status) {
  const value = normalizeStatus(status)
  return BOOKING_STATUSES.find((s) => s.value === value)?.label || value.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase())
}
function money(value) {
  return `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function dateLabel(value) {
  if (!value) return '—'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}
function reference(prefix) { return `${prefix}-${Date.now().toString().slice(-8)}` }
function generateBookingReference() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `OR-${yy}${mm}${dd}-${rand}`
}
function whatsappUrl(phone, message = '') {
  let number = String(phone || '').replace(/\D/g, '')
  if (!number) return ''
  if (number.startsWith('0')) number = `234${number.slice(1)}`
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}
function addDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + Number(days || 0))
  return date.toISOString().slice(0, 10)
}

/* Builds the printable (save-as-PDF) document shell. */
function buildDocumentHtml(title, body, settings) {
  const businessName = escapeHtml(settings.business_name || 'Opet Realms')
  const phone = escapeHtml(settings.phone || '')
  const email = escapeHtml(settings.email || '')
  const address = escapeHtml(settings.address || '')
  return `<!doctype html><html><head><title>${escapeHtml(title)}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#17231d;margin:0;background:#f6f9f7;line-height:1.5;font-size:12px}.sheet{max-width:850px;margin:24px auto;background:#fff;padding:38px 42px;box-shadow:0 4px 24px #102b1b12}.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #087f5b;padding-bottom:20px}.logo{display:block;width:170px;max-height:64px;object-fit:contain;object-position:left center;margin-bottom:7px}.brand{font-size:24px;font-weight:800;letter-spacing:.3px;color:#087f5b}.tag{font-size:10px;letter-spacing:1.4px;color:#68746d;margin-top:3px}.contact{text-align:right;color:#68746d;font-size:11px}.doc-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin:26px 0 24px}.doc-title{font-size:27px;letter-spacing:.5px;line-height:1.1;margin:0;color:#17231d}.ref{font-size:12px;color:#087f5b;font-weight:700;margin-top:8px}.meta{border:1px solid #e2e9e4;border-radius:7px;min-width:205px;overflow:hidden}.meta div{display:flex;justify-content:space-between;gap:18px;padding:7px 10px;border-bottom:1px solid #e2e9e4}.meta div:last-child{border:0}.meta span:first-child{color:#68746d}.meta span:last-child{font-weight:700;text-align:right}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:25px}.block-title{font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:#087f5b;font-weight:800;margin-bottom:8px}.details{background:#f6f9f7;border:1px solid #e2e9e4;border-radius:7px;padding:13px}.details p{margin:3px 0;overflow-wrap:anywhere}.section{margin:22px 0}.section h3{font-size:12px;margin:0 0 9px;color:#087f5b}.description{white-space:pre-wrap;overflow-wrap:anywhere}.total{margin-left:auto;width:300px;max-width:100%;margin-top:14px}.total div{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid #e2e9e4}.total .grand{background:#087f5b;color:#fff;font-weight:800;font-size:15px;border:0;border-radius:0 0 5px 5px}.total .subtle{background:#f0faf5;font-weight:700}.callout{background:#f0faf5;border:1px solid #e2e9e4;border-radius:7px;padding:14px;margin-top:18px}.callout h3{margin:0 0 7px;color:#087f5b;font-size:12px}.callout p{margin:4px 0;white-space:pre-wrap;overflow-wrap:anywhere}.foot{border-top:1px solid #e2e9e4;margin-top:30px;padding-top:13px;color:#68746d;font-size:10px;display:flex;justify-content:space-between;gap:12px}.small{color:#68746d;font-size:10px}@media print{body{background:#fff}.sheet{margin:0 auto;padding:20px 24px;box-shadow:none;max-width:none}@page{size:A4;margin:10mm}}@media(max-width:620px){.sheet{margin:0;padding:20px}.top,.doc-head{flex-direction:column}.contact{text-align:left}.columns{grid-template-columns:1fr}.meta{width:100%}}
    </style></head><body><main class="sheet"><header class="top"><div><img class="logo" src="/images/opet-realms-logo.png.jpg" alt="Opet Realms logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="brand" style="display:none">${businessName}</div><div class="tag">PROFESSIONAL CLEANING · FUMIGATION · GARMENT CARE</div></div><div class="contact">${[phone, email, address].filter(Boolean).join('<br>')}</div></header>${body}<footer class="foot"><span>${businessName}${phone ? ` · ${phone}` : ''}</span><span>Thank you for choosing Opet Realms.</span></footer><script>window.onload=()=>window.print()</script></main></body></html>`
}

/* ------------------------------------------------------------------ */
/* Small shared components                                             */
/* ------------------------------------------------------------------ */
function StatusPill({ status }) {
  const value = normalizeStatus(status || 'unpaid')
  const green = ['#dff7e9', '#166534']
  const red = ['#fee2e2', '#991b1b']
  const amber = ['#fff4d6', '#92400e']
  const palette = {
    paid: green, completed: green, accepted: green, booked: green,
    cancelled: red, declined: red, expired: red,
    new: ['#e8f1ff', '#1d4ed8'], inspection: ['#f3e8ff', '#7e22ce'],
  }[value] || amber
  return <span style={{ display: 'inline-block', borderRadius: 20, padding: '4px 9px', background: palette[0], color: palette[1], fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{formatStatus(status)}</span>
}

function Heading({ children, description, action }) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}><div><h2 style={{ margin: 0, fontSize: 17, lineHeight: 1.4, fontWeight: 750, color: DARK }}>{children}</h2>{description && <p style={{ color: MUTED, fontSize: 13, margin: '4px 0 0' }}>{description}</p>}</div>{action}</div>
}

/* Compact three-dot menu. Items: { label, icon, onClick } or { label, icon, href }. */
function RowMenu({ label: ariaLabel, items }) {
  const [pos, setPos] = useState(null)
  useEffect(() => {
    if (!pos) return undefined
    const close = () => setPos(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('click', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('click', close)
    }
  }, [pos])
  const visible = items.filter(Boolean)
  if (!visible.length) return <span style={{ color: MUTED }}>—</span>
  function toggle(event) {
    event.stopPropagation()
    if (pos) { setPos(null); return }
    const rect = event.currentTarget.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, right: Math.max(8, window.innerWidth - rect.right) })
  }
  const itemStyle = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 0, background: '#fff', color: DARK, fontSize: 13, textAlign: 'left', cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box', whiteSpace: 'nowrap' }
  return <>
    <button type="button" aria-label={ariaLabel} aria-haspopup="menu" aria-expanded={Boolean(pos)} onClick={toggle} style={{ ...ghostButton, minHeight: 34, width: 34, padding: 0 }}><MoreVertical size={16} /></button>
    {pos && <div role="menu" style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 60, minWidth: 210, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, boxShadow: '0 8px 24px rgba(23,35,29,.14)', overflow: 'hidden' }}>
      {visible.map((item) => {
        const Icon = item.icon
        const content = <>{Icon && <Icon size={15} color={GREEN} />}{item.label}</>
        return item.href
          ? <a key={item.label} role="menuitem" href={item.href} target="_blank" rel="noreferrer" style={itemStyle} onClick={() => setPos(null)}>{content}</a>
          : <button key={item.label} type="button" role="menuitem" style={itemStyle} onClick={() => { setPos(null); item.onClick() }}>{content}</button>
      })}
    </div>}
  </>
}

/* ------------------------------------------------------------------ */
/* Staff dashboard                                                     */
/* ------------------------------------------------------------------ */
export default function StaffDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [savingQuote, setSavingQuote] = useState(false)
  const [savingReceipt, setSavingReceipt] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [staffName, setStaffName] = useState('Team member')
  const [permissions, setPermissions] = useState(noPermissions)
  const [bookings, setBookings] = useState([])
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [receipts, setReceipts] = useState([])
  const [bankSettings, setBankSettings] = useState({ business_name: 'Opet Realms', phone: '', email: '', address: '', bank_name: '', account_name: '', account_number: '', default_invoice_notes: '', default_invoice_payment_terms: '', quote_validity_days: 7 })
  const [activeSection, setActiveSection] = useState('overview')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [quoteSearch, setQuoteSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [receiptSearch, setReceiptSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadWarnings, setLoadWarnings] = useState([])
  const [invoiceForm, setInvoiceForm] = useState({ ...emptyInvoiceForm })
  const [quoteForm, setQuoteForm] = useState(emptyQuoteForm)
  const [receiptForm, setReceiptForm] = useState(emptyReceiptForm)

  const loadDashboard = useCallback(async () => {
    setError('')
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) { navigate('/admin/login', { replace: true }); return }
      const { data: profile, error: profileError } = await supabase.from('staff_profiles').select('id, full_name, email, role, is_active').eq('id', session.user.id).maybeSingle()
      if (profileError) throw profileError
      if (!profile || !profile.is_active) { await supabase.auth.signOut(); navigate('/admin/login', { replace: true }); return }
      if (profile.role === 'admin') { navigate('/admin', { replace: true }); return }
      setStaffName(profile.full_name || 'Team member')
      const { data: row, error: permissionError } = await supabase.from('staff_permissions').select('view_bookings, manage_bookings, view_invoices, manage_invoices, view_quotes, manage_quotes, view_receipts, manage_receipts').eq('staff_id', session.user.id).maybeSingle()
      if (permissionError) throw permissionError
      const granted = {
        view_bookings: Boolean(row?.view_bookings || row?.manage_bookings), manage_bookings: Boolean(row?.manage_bookings),
        view_invoices: Boolean(row?.view_invoices || row?.manage_invoices), manage_invoices: Boolean(row?.manage_invoices),
        view_quotes: Boolean(row?.view_quotes || row?.manage_quotes), manage_quotes: Boolean(row?.manage_quotes),
        view_receipts: Boolean(row?.view_receipts || row?.manage_receipts), manage_receipts: Boolean(row?.manage_receipts),
      }
      setPermissions(granted)
      const none = { data: [], error: null }
      const [br, qr, ir, rr, sr] = await Promise.all([
        granted.view_bookings ? supabase.from('bookings').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        granted.view_quotes ? supabase.from('quotes').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        granted.view_invoices ? supabase.from('invoices').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        granted.view_receipts ? supabase.from('receipts').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        (granted.manage_invoices || granted.view_invoices || granted.view_quotes || granted.view_receipts) ? supabase.from('business_settings').select('*').eq('id', 1).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ])
      // Each module is handled on its own so one failure never blocks the others.
      const problems = []
      const take = (result, name, setter) => {
        if (result.error) { console.error(`${name} failed to load:`, result.error); problems.push(`${name} could not be loaded: ${result.error.message}`) } else setter(result.data || [])
      }
      take(br, 'Bookings', setBookings)
      take(qr, 'Quotes', setQuotes)
      take(ir, 'Invoices', setInvoices)
      take(rr, 'Receipts', setReceipts)
      if (!sr.error && sr.data) setBankSettings((current) => ({ ...current, ...sr.data }))
      setLoadWarnings(problems)
    } catch (err) {
      console.error('Staff dashboard error:', err)
      setError(err.message || 'Unable to load your dashboard.')
    } finally { setLoading(false) }
  }, [navigate])
  useEffect(() => { loadDashboard() }, [loadDashboard])

  const bookingCounts = useMemo(() => {
    const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s.value, 0]))
    bookings.forEach((b) => { const s = normalizeStatus(b.status); if (Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1 })
    return counts
  }, [bookings])
  const paidByInvoice = useMemo(() => {
    const map = {}
    receipts.forEach((r) => { map[r.invoice_id] = (map[r.invoice_id] || 0) + Number(r.amount_received || 0) })
    return map
  }, [receipts])
  const totalReceived = useMemo(() => receipts.reduce((sum, r) => sum + Number(r.amount_received || 0), 0), [receipts])
  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase()
    return bookings.filter((b) => {
      const statusMatch = bookingStatusFilter === 'all' || normalizeStatus(b.status) === bookingStatusFilter
      const text = [b.booking_ref, b.customer_name, b.phone, b.email, b.service, b.address].filter(Boolean).join(' ').toLowerCase()
      return statusMatch && (!q || text.includes(q))
    })
  }, [bookings, bookingStatusFilter, bookingSearch])
  const filteredQuotes = useMemo(() => {
    const q = quoteSearch.trim().toLowerCase()
    return quotes.filter((item) => !q || [item.quote_ref, item.customer_name, item.service_description, item.status].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [quotes, quoteSearch])
  const filteredInvoices = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase()
    return !q ? invoices : invoices.filter((item) => [item.invoice_ref, item.customer_name, item.status, item.notes].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [invoices, invoiceSearch])
  const filteredReceipts = useMemo(() => {
    const q = receiptSearch.trim().toLowerCase()
    return receipts.filter((item) => !q || [item.receipt_ref, item.customer_name, item.payment_reference, item.payment_method].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [receipts, receiptSearch])
  const quotableBookings = useMemo(() => bookings.filter((b) => !['cancelled', 'completed'].includes(normalizeStatus(b.status)) && !quotes.some((q) => q.booking_id === b.id)).slice(0, 8), [bookings, quotes])
  const invoiceableBookings = useMemo(() => bookings.filter((b) => !['cancelled'].includes(normalizeStatus(b.status)) && !invoices.some((i) => i.booking_id === b.id)).slice(0, 8), [bookings, invoices])
  const navItems = useMemo(() => [
    (permissions.view_bookings || permissions.view_quotes || permissions.view_invoices || permissions.view_receipts) && { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    permissions.view_bookings && { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    permissions.view_quotes && { id: 'quotes', label: 'Quotes', icon: ClipboardList },
    permissions.view_invoices && { id: 'invoices', label: 'Invoices', icon: FileText },
    permissions.view_receipts && { id: 'receipts', label: 'Receipts', icon: ReceiptText },
  ].filter(Boolean), [permissions])
  const currentSection = navItems.some((item) => item.id === activeSection) ? activeSection : navItems[0]?.id

  function clearMessages() { setError(''); setSuccess('') }
  function newQuoteForm() { return { ...emptyQuoteForm, valid_until: addDays(bankSettings.quote_validity_days || 7) } }

  async function handleSignOut() {
    const { error: e } = await supabase.auth.signOut()
    if (e) { setError(e.message); return }
    navigate('/admin/login', { replace: true })
  }
  async function handleChangePassword(event) {
    event.preventDefault(); clearMessages()
    if (newPassword.length < 8) { setError('Your new password must contain at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setError('The password confirmation does not match.'); return }
    setSavingPassword(true)
    try {
      const { error: e } = await supabase.auth.updateUser({ password: newPassword })
      if (e) throw e
      setNewPassword(''); setConfirmPassword(''); setShowPasswordForm(false); setSuccess('Your password has been changed successfully.')
    } catch (err) { setError(err.message || 'Could not change your password. Please try again.') }
    finally { setSavingPassword(false) }
  }

  /* ---------------- Bookings ---------------- */
  async function handleCreateBooking(event, bookingDetails) {
    event.preventDefault(); clearMessages()
    if (!permissions.manage_bookings) { setError('You do not have permission to create bookings.'); return }
    setSavingBooking(true)
    try {
      const bookingRef = generateBookingReference()
      const { error: e } = await supabase.from('bookings').insert({ ...bookingDetails, booking_ref: bookingRef, status: 'new' })
      if (e) throw e
      setBookingStatusFilter('all'); setBookingSearch(''); setShowBookingForm(false); setSuccess(`Booking ${bookingRef} created successfully.`); setActiveSection('bookings'); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create the booking.') }
    finally { setSavingBooking(false) }
  }
  async function updateBookingStatus(id, status) {
    clearMessages()
    if (!permissions.manage_bookings) { setError('You do not have permission to change booking status.'); return }
    try {
      const { error: e } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (e) throw e
      setSuccess(`Booking status updated to ${formatStatus(status)}.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update booking status.') }
  }
  function openStage(status) { setBookingStatusFilter(status); setActiveSection('bookings'); clearMessages() }
  function selectBookingForQuote(booking) {
    setQuoteForm({ ...newQuoteForm(), booking_id: booking.id, customer_name: booking.customer_name || '', customer_phone: booking.phone || '', customer_email: booking.email || '', service_description: [booking.service, booking.property_type].filter(Boolean).join(' — ') })
    setShowQuoteForm(true); setActiveSection('quotes'); clearMessages()
  }
  function selectBookingForInvoice(booking) {
    setInvoiceForm({ ...emptyInvoiceForm, booking_id: booking.id, customer_name: booking.customer_name || '', description: [booking.service, booking.property_type].filter(Boolean).join(' — '), notes: bankSettings.default_invoice_notes || '', payment_terms: bankSettings.default_invoice_payment_terms || '' })
    setShowInvoiceForm(true); setActiveSection('invoices'); clearMessages()
  }

  /* ---------------- Quotes ---------------- */
  async function handleCreateQuote(event) {
    event.preventDefault(); clearMessages()
    if (!permissions.manage_quotes) { setError('You do not have permission to create quotations.'); return }
    setSavingQuote(true)
    try {
      const booking = bookings.find((item) => item.id === quoteForm.booking_id)
      if (!booking) throw new Error('Select an existing booking before creating a quotation.')
      if (!quoteForm.customer_name.trim()) throw new Error('Enter the customer name.')
      if (!quoteForm.service_description.trim()) throw new Error('Enter the quotation description.')
      const amount = Number(quoteForm.amount)
      if (!Number.isFinite(amount) || amount < 0) throw new Error('Enter a valid quotation amount.')
      const quoteRef = reference('QUO')
      const { error: e } = await supabase.from('quotes').insert({ quote_ref: quoteRef, booking_id: booking.id, customer_name: quoteForm.customer_name.trim(), customer_phone: quoteForm.customer_phone.trim() || booking.phone || null, customer_email: quoteForm.customer_email.trim() || booking.email || null, service_description: quoteForm.service_description.trim(), amount, status: 'draft', issue_date: today(), valid_until: quoteForm.valid_until || null, notes: quoteForm.notes.trim() || null })
      if (e) throw e
      setQuoteForm(newQuoteForm()); setShowQuoteForm(false); setSuccess(`Quotation ${quoteRef} created successfully.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create quotation.') }
    finally { setSavingQuote(false) }
  }
  async function updateQuoteStatus(id, status) {
    clearMessages()
    if (!permissions.manage_quotes) { setError('You do not have permission to update quotations.'); return }
    try {
      const { error: e } = await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (e) throw e
      setSuccess(`Quotation status updated to ${status}.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update quotation status.') }
  }

  /* ---------------- Invoices ---------------- */
  async function handleCreateInvoice(event) {
    event.preventDefault(); clearMessages()
    if (!permissions.manage_invoices) { setError('You do not have permission to create invoices.'); return }
    setSavingInvoice(true)
    try {
      const subtotal = Number(invoiceForm.amount)
      const discountPercent = Number(invoiceForm.discount_percent || 0)
      if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) throw new Error('Discount must be between 0 and 100%.')
      const discountAmount = Math.round(subtotal * discountPercent) / 100
      const amount = Math.round((subtotal - discountAmount) * 100) / 100
      if (!invoiceForm.customer_name.trim()) throw new Error('Enter the customer name.')
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid invoice amount.')
      const invoiceRef = reference('INV')
      const deposit = invoiceForm.payment_option === 'deposit' ? Math.round(amount * 0.7 * 100) / 100 : amount
      const details = [invoiceForm.description.trim(), `Subtotal: ${money(subtotal)}. Discount: ${discountPercent}% (${money(discountAmount)}). Final total: ${money(amount)}.`, invoiceForm.notes.trim(), invoiceForm.payment_terms.trim() ? `Payment terms: ${invoiceForm.payment_terms.trim()}` : '', invoiceForm.payment_option === 'deposit' ? `70% deposit due: ${money(deposit)}. Balance: ${money(amount - deposit)}.` : '', bankSettings.bank_name ? `Bank: ${bankSettings.bank_name}` : '', bankSettings.account_name ? `Account name: ${bankSettings.account_name}` : '', bankSettings.account_number ? `Account number: ${bankSettings.account_number}` : ''].filter(Boolean).join('\n')
      const { error: e } = await supabase.from('invoices').insert({ invoice_ref: invoiceRef, booking_id: invoiceForm.booking_id || null, customer_name: invoiceForm.customer_name.trim(), amount, status: 'unpaid', issue_date: invoiceForm.issue_date || null, due_date: invoiceForm.due_date || null, notes: details })
      if (e) throw e
      setInvoiceForm({ ...emptyInvoiceForm, payment_terms: bankSettings.default_invoice_payment_terms || '' }); setShowInvoiceForm(false); setSuccess(`Invoice ${invoiceRef} created successfully.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create the invoice. Check the invoice fields against your Supabase table.') }
    finally { setSavingInvoice(false) }
  }
  async function updateInvoiceStatus(id, status) {
    clearMessages()
    if (!permissions.manage_invoices) { setError('You do not have permission to change invoice status.'); return }
    try {
      const { error: e } = await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (e) throw e
      setSuccess(`Invoice marked ${status}.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update invoice status.') }
  }

  /* ---------------- Receipts ---------------- */
  async function handleCreateReceipt(event) {
    event.preventDefault(); clearMessages()
    if (!permissions.manage_receipts) { setError('You do not have permission to record payments.'); return }
    setSavingReceipt(true)
    try {
      const invoice = invoices.find((item) => item.id === receiptForm.invoice_id)
      if (!invoice) throw new Error('Select an invoice for this receipt.')
      if (!receiptForm.verified) throw new Error('Confirm that the payment has been verified before issuing a receipt.')
      const amountReceived = Number(receiptForm.amount_received)
      if (!Number.isFinite(amountReceived) || amountReceived <= 0) throw new Error('Enter an amount received greater than zero.')
      const alreadyPaid = paidByInvoice[invoice.id] || 0
      if (amountReceived > Math.max(0, Number(invoice.amount || 0) - alreadyPaid) + 0.001) throw new Error('The payment is greater than the outstanding balance.')
      const receiptRef = reference('RCT')
      const { error: e } = await supabase.from('receipts').insert({ receipt_ref: receiptRef, invoice_id: invoice.id, booking_id: invoice.booking_id || null, customer_name: invoice.customer_name, amount_received: amountReceived, payment_date: receiptForm.payment_date || today(), payment_method: receiptForm.payment_method, payment_reference: receiptForm.payment_reference.trim() || null, notes: receiptForm.notes.trim() || null })
      if (e) throw e
      const totalPaid = alreadyPaid + amountReceived
      if (permissions.manage_invoices) {
        const { error: statusError } = await supabase.from('invoices').update({ status: totalPaid >= Number(invoice.amount || 0) - 0.001 ? 'paid' : 'unpaid' }).eq('id', invoice.id)
        if (statusError) console.error('Receipt saved, but invoice status could not be refreshed:', statusError)
      }
      setReceiptForm({ ...emptyReceiptForm }); setShowReceiptForm(false); setSuccess(`Receipt ${receiptRef} recorded.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not record payment and create receipt.') }
    finally { setSavingReceipt(false) }
  }

  /* ---------------- Printable documents ---------------- */
  function printDocument(title, body) {
    const popup = window.open('', '_blank', 'width=950,height=800')
    if (!popup) { setError('Your browser blocked the document window. Allow pop-ups for this site and try again.'); return }
    popup.document.write(buildDocumentHtml(title, body, bankSettings))
    popup.document.close()
  }
  function printQuote(quote) {
    const booking = bookings.find((item) => item.id === quote.booking_id)
    const body = `<div class="doc-head"><div><h1 class="doc-title">QUOTATION</h1><div class="ref">${escapeHtml(quote.quote_ref || 'Quotation')}</div></div><div class="meta"><div><span>Issue date</span><span>${escapeHtml(dateLabel(quote.issue_date))}</span></div><div><span>Valid until</span><span>${escapeHtml(dateLabel(quote.valid_until))}</span></div><div><span>Booking ref.</span><span>${escapeHtml(booking?.booking_ref || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Prepared for</div><p><strong>${escapeHtml(quote.customer_name || 'Customer')}</strong></p><p>${escapeHtml(quote.customer_phone || booking?.phone || '')}</p><p>${escapeHtml(quote.customer_email || booking?.email || '')}</p></section><section class="details"><div class="block-title">Service details</div><p>${escapeHtml(booking?.address || '')}</p><p>${escapeHtml(booking?.service || '')}${booking?.property_type ? ` · ${escapeHtml(booking.property_type)}` : ''}</p></section></div><section class="section"><h3>Proposed service</h3><div class="details description">${escapeHtml(quote.service_description || 'Service as discussed')}</div><div class="total"><div class="grand"><span>Quotation total</span><span>${escapeHtml(money(quote.amount))}</span></div></div></section>${quote.notes ? `<section class="callout"><h3>Additional notes</h3><p>${escapeHtml(quote.notes)}</p></section>` : ''}<section class="callout"><h3>About this quotation</h3><p>This quotation outlines the proposed service and estimated price. Please confirm acceptance before the validity date. Payment arrangements will be stated on the invoice issued for approved work.</p></section>`
    printDocument(quote.quote_ref || 'Quotation', body)
  }
  function printInvoice(invoice) {
    const booking = bookings.find((item) => item.id === invoice.booking_id)
    const paid = paidByInvoice[invoice.id] || 0
    const amount = Number(invoice.amount || 0)
    const balance = Math.max(0, amount - paid)
    const notes = String(invoice.notes || '')
    const description = notes.split('\n').filter((line) => !/^(Payment terms:|Bank:|Account name:|Account number:|70% deposit due:)/i.test(line.trim())).join('\n').trim()
    const paymentTerms = notes.split('\n').filter((line) => /^Payment terms:/i.test(line.trim())).map((line) => line.replace(/^Payment terms:\s*/i, '')).join('\n') || bankSettings.default_invoice_payment_terms || 'Please pay by the due date shown.'
    const deposit = notes.includes('70% deposit due:')
    const body = `<div class="doc-head"><div><h1 class="doc-title">INVOICE</h1><div class="ref">${escapeHtml(invoice.invoice_ref || 'Invoice')}</div><p class="small">Payment request for the service listed below</p></div><div class="meta"><div><span>Issue date</span><span>${escapeHtml(dateLabel(invoice.issue_date))}</span></div><div><span>Due date</span><span>${escapeHtml(dateLabel(invoice.due_date))}</span></div><div><span>Booking ref.</span><span>${escapeHtml(booking?.booking_ref || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Bill to</div><p><strong>${escapeHtml(invoice.customer_name || 'Customer')}</strong></p><p>${escapeHtml(booking?.phone || '')}</p><p>${escapeHtml(booking?.email || '')}</p><p>${escapeHtml(booking?.address || '')}</p></section><section class="details"><div class="block-title">Service</div><p><strong>${escapeHtml(booking?.service || description.split('\n')[0] || 'Professional service')}</strong></p><p>${escapeHtml(booking?.property_type || '')}</p></section></div><section class="section"><h3>Invoice summary</h3><div class="details description">${escapeHtml(description || 'Service as agreed with the customer.')}</div><div class="total"><div><span>Invoice total</span><strong>${escapeHtml(money(amount))}</strong></div><div><span>Paid to date</span><strong>${escapeHtml(money(paid))}</strong></div><div class="subtle"><span>Balance outstanding</span><strong>${escapeHtml(money(balance))}</strong></div><div class="grand"><span>${deposit ? '70% deposit due' : 'Amount due'}</span><span>${escapeHtml(money(balance))}</span></div></div></section><div class="columns"><section class="callout"><h3>Payment terms</h3><p>${escapeHtml(paymentTerms)}</p></section><section class="callout"><h3>Bank transfer details</h3><p>${escapeHtml(bankSettings.bank_name || 'Bank details not provided')}</p><p>Account name: ${escapeHtml(bankSettings.account_name || 'Not set')}</p><p>Account number: ${escapeHtml(bankSettings.account_number || 'Not set')}</p></section></div>`
    printDocument(invoice.invoice_ref || 'Invoice', body)
  }
  function printReceipt(receipt) {
    const invoice = invoices.find((item) => item.id === receipt.invoice_id)
    const paidToDate = paidByInvoice[receipt.invoice_id] || 0
    const total = Number(invoice?.amount || 0)
    const balance = Math.max(0, total - paidToDate)
    const body = `<div class="doc-head"><div><h1 class="doc-title">PAYMENT RECEIPT</h1><div class="ref">${escapeHtml(receipt.receipt_ref || 'Receipt')}</div></div><div class="meta"><div><span>Receipt date</span><span>${escapeHtml(dateLabel(receipt.payment_date))}</span></div><div><span>Invoice ref.</span><span>${escapeHtml(invoice?.invoice_ref || '—')}</span></div><div><span>Payment ref.</span><span>${escapeHtml(receipt.payment_reference || '—')}</span></div></div></div><div class="columns"><section class="details"><div class="block-title">Received from</div><p><strong>${escapeHtml(receipt.customer_name || invoice?.customer_name || 'Customer')}</strong></p></section><section class="details"><div class="block-title">Payment details</div><p>Method: ${escapeHtml(String(receipt.payment_method || '').replaceAll('_', ' '))}</p><p>Date: ${escapeHtml(dateLabel(receipt.payment_date))}</p><p>Service: ${escapeHtml(bookings.find((b) => b.id === invoice?.booking_id)?.service || '')}</p></section></div><section class="section"><h3>Payment summary</h3><div class="total"><div><span>Invoice total</span><strong>${escapeHtml(money(total))}</strong></div><div><span>Received this time</span><strong>${escapeHtml(money(receipt.amount_received))}</strong></div><div><span>Total paid to date</span><strong>${escapeHtml(money(paidToDate))}</strong></div><div class="subtle"><span>Outstanding balance</span><strong>${escapeHtml(money(balance))}</strong></div><div class="grand"><span>Payment status</span><span>${balance <= 0 ? 'PAID IN FULL' : 'PART PAYMENT'}</span></div></div></section>${receipt.notes ? `<section class="callout"><h3>Notes</h3><p>${escapeHtml(receipt.notes)}</p></section>` : ''}<section class="callout"><h3>Thank you</h3><p>Your payment has been recorded. Thank you for choosing Opet Realms.</p></section>`
    printDocument(receipt.receipt_ref || 'Payment Receipt', body)
  }

  /* ---------------- Render helpers ---------------- */
  function bookingStageCards() {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 10, marginBottom: 16 }}>{BOOKING_STATUSES.map((s) => {
      const active = currentSection === 'bookings' && bookingStatusFilter === s.value
      return <button key={s.value} type="button" onClick={() => openStage(s.value)} aria-pressed={active} style={{ ...panel, marginBottom: 0, textAlign: 'left', cursor: 'pointer', border: active ? `2px solid ${GREEN}` : `1px solid ${BORDER}`, padding: 13, background: active ? SOFT : '#fff', color: DARK }}><span style={{ display: 'block', fontSize: 12, color: MUTED, marginBottom: 5 }}>{s.label}</span><strong style={{ fontSize: 23 }}>{bookingCounts[s.value]}</strong></button>
    })}</div>
  }
  function bookingsTable(rows) {
    if (!rows.length) return <p style={{ color: MUTED, fontSize: 13 }}>No bookings match your search.</p>
    return <div style={{ overflowX: 'auto' }}><table style={{ ...table, minWidth: 1250 }}><thead><tr>{['Reference', 'Received', 'Customer', 'Phone', 'Email', 'Service / Property', 'Address', 'Notes', 'Preferred date', 'Status', 'Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{rows.map((b) => {
      const message = `Hello ${b.customer_name || ''}, we are contacting you about your Opet Realms booking ${b.booking_ref || ''} for ${b.service || 'our cleaning service'}.`
      const chat = whatsappUrl(b.phone, message)
      return <tr key={b.id}>
        <td style={td}><strong>{b.booking_ref || '—'}</strong></td>
        <td style={td}>{dateLabel(b.created_at?.slice(0, 10))}</td>
        <td style={td}><strong>{b.customer_name || '—'}</strong></td>
        <td style={td}>{b.phone || '—'}</td>
        <td style={{ ...td, overflowWrap: 'anywhere' }}>{b.email || '—'}</td>
        <td style={td}>{b.service || '—'}{b.property_type && <div style={subText}>{b.property_type}</div>}</td>
        <td style={td}>{b.address || '—'}</td>
        <td style={{ ...td, minWidth: 140 }}>{b.notes || '—'}</td>
        <td style={td}>{dateLabel(b.preferred_date)}{b.preferred_time && <div style={subText}>{b.preferred_time}</div>}</td>
        <td style={td}>{permissions.manage_bookings ? <select aria-label={`Status for ${b.booking_ref || b.customer_name}`} value={normalizeStatus(b.status)} onChange={(e) => updateBookingStatus(b.id, e.target.value)} style={{ ...input, minWidth: 120, padding: '6px 8px', fontSize: 12 }}>{BOOKING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select> : <StatusPill status={b.status} />}</td>
        <td style={td}><RowMenu label={`Actions for ${b.booking_ref || b.customer_name}`} items={[
          permissions.manage_quotes && { label: 'Create Quote', icon: ClipboardList, onClick: () => selectBookingForQuote(b) },
          permissions.manage_invoices && { label: 'Create Invoice', icon: FileText, onClick: () => selectBookingForInvoice(b) },
          chat && { label: 'Message on WhatsApp', icon: MessageCircle, href: chat },
        ]} /></td>
      </tr>
    })}</tbody></table></div>
  }
  function invoicesTable(rows) {
    if (!rows.length) return <p style={{ color: MUTED, fontSize: 13 }}>No invoices found.</p>
    return <div style={{ overflowX: 'auto' }}><table style={{ ...table, minWidth: 900 }}><thead><tr>{['Invoice', 'Customer', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{rows.map((i) => {
      const paid = paidByInvoice[i.id] || 0
      const balance = Math.max(0, Number(i.amount || 0) - paid)
      return <tr key={i.id}><td style={td}><strong>{i.invoice_ref || '—'}</strong>{i.booking_id && <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>Booking linked</div>}</td><td style={td}>{i.customer_name || '—'}</td><td style={td}>{dateLabel(i.issue_date)}{i.due_date && <div style={subText}>Due {dateLabel(i.due_date)}</div>}</td><td style={td}>{money(i.amount)}</td><td style={td}>{money(paid)}</td><td style={td}>{money(balance)}</td><td style={td}>{permissions.manage_invoices ? <select aria-label={`Payment status for ${i.invoice_ref || i.customer_name}`} value={String(i.status || 'unpaid').toLowerCase()} onChange={(e) => updateInvoiceStatus(i.id, e.target.value)} style={{ ...input, minWidth: 110, padding: '6px 8px', fontSize: 12 }}><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="pending">Pending</option></select> : <StatusPill status={i.status || 'unpaid'} />}</td><td style={td}><button type="button" style={smallButton} onClick={() => printInvoice(i)}>Download / Print PDF</button></td></tr>
    })}</tbody></table></div>
  }
  function bookingPicker(list, actionLabel, onPick, emptyText) {
    if (!list.length) return <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{emptyText}</p>
    return <div style={{ overflowX: 'auto' }}><table style={{ ...table, minWidth: 520 }}><thead><tr>{['Booking', 'Customer', 'Service', ''].map((h, idx) => <th key={idx} style={th}>{h}</th>)}</tr></thead><tbody>{list.map((b) => <tr key={b.id}><td style={td}><strong>{b.booking_ref || '—'}</strong></td><td style={td}>{b.customer_name || '—'}<div style={subText}>{b.phone || ''}</div></td><td style={td}>{[b.service, b.property_type].filter(Boolean).join(' — ') || '—'}</td><td style={td}><button type="button" style={smallButton} onClick={() => onPick(b)}><Plus size={13} /> {actionLabel}</button></td></tr>)}</tbody></table></div>
  }

  if (loading) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: GREEN }}><div style={{ textAlign: 'center' }}><LoaderCircle size={30} /><p>Loading your dashboard...</p></div></main>
  const hasAccess = navItems.length > 0
  const unpaid = invoices.filter((i) => !['paid', 'completed'].includes(String(i.status || '').toLowerCase())).length
  const cards = [
    permissions.view_bookings && { label: 'Total bookings', value: bookings.length, icon: CalendarDays },
    permissions.view_quotes && { label: 'Total quotes', value: quotes.length, icon: ClipboardList },
    permissions.view_invoices && { label: 'Total invoices', value: invoices.length, icon: FileText },
    permissions.view_receipts && { label: 'Receipts issued', value: receipts.length, icon: ReceiptText },
    permissions.view_invoices && { label: 'Unpaid invoices', value: unpaid, icon: Wallet },
  ].filter(Boolean)

  return <main className="opet-staff-dashboard" style={{ minHeight: '100vh', background: PAGE, color: DARK, padding: '20px 0 42px' }}><div className="opet-dashboard-shell" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto' }}>
    <header className="opet-dashboard-header" style={{ ...panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}><div><p style={{ color: GREEN, fontWeight: 800, fontSize: 11, letterSpacing: 1, margin: '0 0 3px' }}>OPET REALMS</p><h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.3 }}>Staff Dashboard</h1><p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>Welcome back, {staffName}.</p></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" style={ghostButton} onClick={() => { setShowPasswordForm((v) => !v); clearMessages() }}><ShieldCheck size={15} /> Change password</button><button type="button" style={button} onClick={loadDashboard}><RefreshCw size={15} /> Refresh</button><button type="button" style={{ ...button, background: DARK, borderColor: DARK }} onClick={handleSignOut}><LogOut size={15} /> Sign out</button></div></header>
    {showPasswordForm && <section style={panel}><Heading description="Choose a new password for your staff login. Use at least 8 characters." action={<button type="button" style={ghostButton} onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword('') }}><X size={15} /> Cancel</button>}>Change password</Heading><form onSubmit={handleChangePassword} style={grid}><label style={label}>New password<input style={input} type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label><label style={label}>Confirm new password<input style={input} type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label><div style={{ display: 'flex', alignItems: 'end' }}><button type="submit" style={button} disabled={savingPassword}>{savingPassword ? <LoaderCircle size={15} /> : <Save size={15} />}{savingPassword ? 'Updating password...' : 'Save new password'}</button></div></form></section>}
    {hasAccess && <nav className="opet-dashboard-nav" aria-label="Staff sections" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>{navItems.map((item) => { const Icon = item.icon; const active = currentSection === item.id; return <button type="button" key={item.id} onClick={() => { setActiveSection(item.id); clearMessages() }} style={{ ...button, background: active ? GREEN : '#fff', color: active ? '#fff' : GREEN, borderColor: active ? GREEN : BORDER }}><Icon size={15} /> {item.label}</button> })}</nav>}
    {error && <div role="alert" style={{ ...panel, color: '#9f2424', borderColor: '#f0c7c7', background: '#fff8f8', fontSize: 13 }}>{error}</div>}
    {success && <div role="status" style={{ ...panel, color: '#065f46', borderColor: '#b9e3cf', background: '#f1fbf5', fontSize: 13 }}>{success}</div>}
    {loadWarnings.length > 0 && <div role="status" style={{ ...panel, color: '#854d0e', borderColor: '#f3deaa', background: '#fff8e8', fontSize: 13 }}>{loadWarnings.map((w) => <div key={w}>{w}</div>)}</div>}
    {!hasAccess && !error && <section style={panel}><Heading description="Your account is active, but no sections have been assigned to you yet."><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={18} color={GREEN} /> No access yet</span></Heading><p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Ask an admin to turn on your permissions in Staff Management, then press Refresh.</p></section>}

    {/* OVERVIEW: summary cards and booking stages only */}
    {currentSection === 'overview' && <>
      {cards.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 18 }}>{cards.map((c) => { const Icon = c.icon; return <section key={c.label} style={{ ...panel, marginBottom: 0 }}><Icon size={21} color={GREEN} /><p style={{ color: MUTED, margin: '8px 0 3px', fontSize: 12 }}>{c.label}</p><strong style={{ fontSize: 26 }}>{c.value}</strong></section> })}</div>}
      {permissions.view_bookings && <section style={panel}><Heading description="Select a stage to open bookings at that point in the workflow.">Booking stages</Heading>{bookingStageCards()}</section>}
    </>}

    {/* BOOKINGS */}
    {currentSection === 'bookings' && <>
      <section style={panel}><Heading description="Choose a stage to filter bookings.">Booking stages</Heading>{bookingStageCards()}<div style={grid}><label style={label}>Filter by status<select style={input} value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}><option value="all">All bookings ({bookings.length})</option>{BOOKING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label} ({bookingCounts[s.value]})</option>)}</select></label><label style={label}>Search bookings<div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', top: 12, left: 11, color: MUTED }} /><input style={{ ...input, paddingLeft: 34 }} placeholder="Name, phone, reference, service..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} /></div></label></div></section>
      {permissions.manage_bookings && <section style={panel}><Heading description="Add a booking received by phone, WhatsApp, or another channel." action={<button type="button" style={button} onClick={() => setShowBookingForm((v) => !v)}>{showBookingForm ? <X size={15} /> : <Plus size={15} />}{showBookingForm ? 'Close form' : 'Create booking'}</button>}>Create a booking</Heading>{showBookingForm && <MultiServiceBookingFields saving={savingBooking} error={error} onSubmit={handleCreateBooking} />}</section>}
      <section style={panel}><Heading description={`${filteredBookings.length} booking(s) found.${permissions.manage_bookings ? '' : ' You have view-only access to bookings.'}`}>All bookings</Heading>{bookingsTable(filteredBookings)}</section>
    </>}

    {/* QUOTES */}
    {currentSection === 'quotes' && <>
      {permissions.manage_quotes && <section style={panel}><Heading description="Create a quotation for a booking. The form stays closed until you open it." action={<button type="button" style={button} onClick={() => { if (!showQuoteForm) setQuoteForm((f) => (f.valid_until ? f : newQuoteForm())); setShowQuoteForm((v) => !v) }}>{showQuoteForm ? <X size={15} /> : <Plus size={15} />}{showQuoteForm ? 'Close form' : 'Create quote'}</button>}>Create a quote</Heading>
        {showQuoteForm && <form onSubmit={handleCreateQuote}><div style={grid}><label style={label}>Link booking *<select required style={input} value={quoteForm.booking_id} onChange={(e) => { const b = bookings.find((item) => item.id === e.target.value); setQuoteForm((f) => ({ ...f, booking_id: e.target.value, customer_name: b?.customer_name || f.customer_name, customer_phone: b?.phone || f.customer_phone, customer_email: b?.email || f.customer_email, service_description: b ? [b.service, b.property_type].filter(Boolean).join(' — ') : f.service_description })) }}><option value="">Select a booking</option>{bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_ref || 'Booking'} — {b.customer_name || 'Customer'}</option>)}</select></label><label style={label}>Customer name *<input required style={input} value={quoteForm.customer_name} onChange={(e) => setQuoteForm((f) => ({ ...f, customer_name: e.target.value }))} /></label><label style={label}>Customer phone<input style={input} value={quoteForm.customer_phone} onChange={(e) => setQuoteForm((f) => ({ ...f, customer_phone: e.target.value }))} /></label><label style={label}>Customer email<input type="email" style={input} value={quoteForm.customer_email} onChange={(e) => setQuoteForm((f) => ({ ...f, customer_email: e.target.value }))} /></label><label style={label}>Quotation amount (₦) *<input type="number" min="0" step="0.01" required style={input} value={quoteForm.amount} onChange={(e) => setQuoteForm((f) => ({ ...f, amount: e.target.value }))} /></label><label style={label}>Valid until<input type="date" style={input} value={quoteForm.valid_until} onChange={(e) => setQuoteForm((f) => ({ ...f, valid_until: e.target.value }))} /></label></div><label style={{ ...label, marginTop: 14 }}>Service description *<textarea required style={{ ...input, minHeight: 75, resize: 'vertical' }} value={quoteForm.service_description} onChange={(e) => setQuoteForm((f) => ({ ...f, service_description: e.target.value }))} /></label><p style={{ color: MUTED, fontSize: 12 }}>Payment terms and bank details belong on the invoice, not the quotation.</p><label style={{ ...label, marginTop: 14 }}>Notes<textarea style={{ ...input, minHeight: 65, resize: 'vertical' }} value={quoteForm.notes} onChange={(e) => setQuoteForm((f) => ({ ...f, notes: e.target.value }))} /></label><button type="submit" style={{ ...button, marginTop: 14 }} disabled={savingQuote}>{savingQuote ? <LoaderCircle size={15} /> : <Save size={15} />}{savingQuote ? 'Saving quotation...' : 'Save quotation'}</button></form>}
      </section>}
      {permissions.manage_quotes && permissions.view_bookings && <section style={panel}><Heading description="Active bookings that do not have a quotation yet.">Bookings ready to quote</Heading>{bookingPicker(quotableBookings, 'Create quote', selectBookingForQuote, 'Every active booking already has a quotation.')}</section>}
      <section style={panel}><Heading description="Saved quotations can be searched, status-managed where permitted, and printed or saved as PDF.">All quotations</Heading><label style={{ ...label, maxWidth: 420, marginBottom: 14 }}>Search quotations<input style={input} value={quoteSearch} onChange={(e) => setQuoteSearch(e.target.value)} placeholder="Reference, customer or service" /></label>{filteredQuotes.length ? <div style={{ overflowX: 'auto' }}><table style={table}><thead><tr>{['Reference', 'Customer', 'Description', 'Amount', 'Valid until', 'Status', 'Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{filteredQuotes.map((q) => <tr key={q.id}><td style={td}><strong>{q.quote_ref || '—'}</strong><div style={subText}>{dateLabel(q.issue_date)}</div></td><td style={td}>{q.customer_name || '—'}</td><td style={td}>{q.service_description || '—'}</td><td style={td}>{money(q.amount)}</td><td style={td}>{dateLabel(q.valid_until)}</td><td style={td}>{permissions.manage_quotes ? <select aria-label={`Status for ${q.quote_ref || q.customer_name}`} style={{ ...input, minWidth: 120, padding: '6px 8px', fontSize: 12 }} value={q.status || 'draft'} onChange={(e) => updateQuoteStatus(q.id, e.target.value)}>{QUOTE_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select> : <StatusPill status={q.status || 'draft'} />}</td><td style={td}><button type="button" style={smallButton} onClick={() => printQuote(q)}>Download / Print PDF</button></td></tr>)}</tbody></table></div> : <p style={{ color: MUTED, fontSize: 13 }}>No quotations found.</p>}</section>
    </>}

    {/* INVOICES */}
    {currentSection === 'invoices' && <>
      {permissions.manage_invoices && <section style={panel}><Heading description="Create an invoice for an existing booking or enter a customer manually. The form stays closed until you open it." action={<button type="button" style={button} onClick={() => setShowInvoiceForm((v) => !v)}>{showInvoiceForm ? <X size={15} /> : <Plus size={15} />}{showInvoiceForm ? 'Close form' : 'Create invoice'}</button>}>Create an invoice</Heading>
        {showInvoiceForm && <form onSubmit={handleCreateInvoice}><div style={grid}><label style={label}>Link to booking (optional)<select style={input} value={invoiceForm.booking_id} onChange={(e) => { const b = bookings.find((x) => x.id === e.target.value); setInvoiceForm((f) => ({ ...f, booking_id: e.target.value, customer_name: b?.customer_name || f.customer_name, description: b ? [b.service, b.property_type].filter(Boolean).join(' — ') : f.description })) }}><option value="">No linked booking / manual invoice</option>{bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_ref || 'Booking'} — {b.customer_name || 'Customer'}</option>)}</select></label><label style={label}>Customer name *<input style={input} required value={invoiceForm.customer_name} onChange={(e) => setInvoiceForm((f) => ({ ...f, customer_name: e.target.value }))} /></label><label style={label}>Invoice amount (₦) *<input type="number" min="1" step="0.01" style={input} required value={invoiceForm.amount} onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))} /></label><label style={label}>Discount (%)<input type="number" min="0" max="100" step="0.01" style={input} value={invoiceForm.discount_percent ?? '0'} onChange={(e) => setInvoiceForm((f) => ({ ...f, discount_percent: e.target.value }))} /></label><label style={label}>Payment option<select style={input} value={invoiceForm.payment_option} onChange={(e) => setInvoiceForm((f) => ({ ...f, payment_option: e.target.value }))}><option value="full">Full payment</option><option value="deposit">70% deposit + balance</option></select></label><label style={label}>Issue date<input type="date" style={input} value={invoiceForm.issue_date} onChange={(e) => setInvoiceForm((f) => ({ ...f, issue_date: e.target.value }))} /></label><label style={label}>Due date<input type="date" style={input} value={invoiceForm.due_date} onChange={(e) => setInvoiceForm((f) => ({ ...f, due_date: e.target.value }))} /></label><label style={label}>Service / description<input style={input} value={invoiceForm.description} onChange={(e) => setInvoiceForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Deep cleaning — 4-bedroom flat" /></label></div>{Number(invoiceForm.amount) > 0 && <div style={{ background: SOFT, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginTop: 14, fontSize: 13, lineHeight: 1.8 }}><div><strong>Subtotal:</strong> {money(Number(invoiceForm.amount))}</div><div><strong>Discount:</strong> {Number(invoiceForm.discount_percent || 0)}% ({money(Number(invoiceForm.amount) * Number(invoiceForm.discount_percent || 0) / 100)})</div><div><strong>Final invoice total:</strong> {money(Number(invoiceForm.amount) * (1 - Number(invoiceForm.discount_percent || 0) / 100))}</div>{invoiceForm.payment_option === 'deposit' && <div><strong>70% deposit:</strong> {money(Number(invoiceForm.amount) * (1 - Number(invoiceForm.discount_percent || 0) / 100) * 0.7)} <span style={{ margin: '0 12px', color: MUTED }}>·</span><strong>Remaining balance:</strong> {money(Number(invoiceForm.amount) * (1 - Number(invoiceForm.discount_percent || 0) / 100) * 0.3)}</div>}</div>}<label style={{ ...label, marginTop: 14 }}>Payment terms<textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={invoiceForm.payment_terms} onChange={(e) => setInvoiceForm((f) => ({ ...f, payment_terms: e.target.value }))} placeholder={bankSettings.default_invoice_payment_terms || 'Enter payment terms'} /></label><label style={{ ...label, marginTop: 14 }}>Invoice notes<textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={invoiceForm.notes} onChange={(e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes" /></label>{(bankSettings.bank_name || bankSettings.account_name || bankSettings.account_number) && <div style={{ background: PAGE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 13, marginTop: 14, fontSize: 13, lineHeight: 1.8 }}><strong>Bank transfer details</strong>{bankSettings.bank_name && <div>{bankSettings.bank_name}</div>}{bankSettings.account_name && <div>Account name: {bankSettings.account_name}</div>}{bankSettings.account_number && <div>Account number: {bankSettings.account_number}</div>}</div>}<button type="submit" style={{ ...button, marginTop: 14 }} disabled={savingInvoice}>{savingInvoice ? <LoaderCircle size={15} /> : <Save size={15} />}{savingInvoice ? 'Creating invoice...' : 'Save invoice'}</button></form>}
      </section>}
      {permissions.manage_invoices && permissions.view_bookings && <section style={panel}><Heading description="Active bookings that do not have an invoice yet.">Bookings ready to invoice</Heading>{bookingPicker(invoiceableBookings, 'Create invoice', selectBookingForInvoice, 'Every active booking already has an invoice.')}</section>}
      <section style={panel}><Heading description={permissions.manage_invoices ? 'Search invoices and print or save them as PDF.' : 'You have view-only access to invoices.'}>Invoices</Heading><label style={{ ...label, marginBottom: 14, maxWidth: 420 }}>Search invoices<input style={input} value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="Invoice reference or customer name" /></label>{invoicesTable(filteredInvoices)}</section>
    </>}

    {/* RECEIPTS */}
    {currentSection === 'receipts' && <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}><section style={{ ...panel, marginBottom: 0 }}><ReceiptText size={21} color={GREEN} /><p style={{ color: MUTED, margin: '8px 0 3px', fontSize: 12 }}>Receipts issued</p><strong style={{ fontSize: 26 }}>{receipts.length}</strong></section><section style={{ ...panel, marginBottom: 0 }}><Wallet size={21} color={GREEN} /><p style={{ color: MUTED, margin: '8px 0 3px', fontSize: 12 }}>Total payments received</p><strong style={{ fontSize: 26 }}>{money(totalReceived)}</strong></section></div>
      {permissions.manage_receipts && <section style={panel}><Heading description="Record only payments that have been verified. The form stays closed until opened." action={<button type="button" style={button} onClick={() => setShowReceiptForm((v) => !v)}>{showReceiptForm ? <X size={15} /> : <Plus size={15} />}{showReceiptForm ? 'Close form' : 'Record Payment and Create Receipt'}</button>}>Record a payment</Heading>
        {showReceiptForm && <form onSubmit={handleCreateReceipt}><div style={grid}><label style={label}>Invoice *<select required style={input} value={receiptForm.invoice_id} onChange={(e) => { const i = invoices.find((x) => x.id === e.target.value); const paid = paidByInvoice[e.target.value] || 0; setReceiptForm((f) => ({ ...f, invoice_id: e.target.value, amount_received: i ? String(Math.max(0, Number(i.amount || 0) - paid)) : '' })) }}><option value="">Select invoice</option>{invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').map((i) => <option key={i.id} value={i.id}>{i.invoice_ref || 'Invoice'} — {i.customer_name} ({money(i.amount)})</option>)}</select></label><label style={label}>Amount received (₦) *<input type="number" min="0.01" step="0.01" required style={input} value={receiptForm.amount_received} onChange={(e) => setReceiptForm((f) => ({ ...f, amount_received: e.target.value }))} /></label><label style={label}>Payment date<input type="date" style={input} value={receiptForm.payment_date} onChange={(e) => setReceiptForm((f) => ({ ...f, payment_date: e.target.value }))} /></label><label style={label}>Payment method<select style={input} value={receiptForm.payment_method} onChange={(e) => setReceiptForm((f) => ({ ...f, payment_method: e.target.value }))}>{['bank_transfer', 'cash', 'card', 'other'].map((m) => <option key={m} value={m}>{m.replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}</option>)}</select></label><label style={label}>Payment reference<input style={input} value={receiptForm.payment_reference} onChange={(e) => setReceiptForm((f) => ({ ...f, payment_reference: e.target.value }))} placeholder="Bank transaction reference" /></label></div><label style={{ ...label, marginTop: 14 }}>Notes<textarea style={{ ...input, minHeight: 65, resize: 'vertical' }} value={receiptForm.notes} onChange={(e) => setReceiptForm((f) => ({ ...f, notes: e.target.value }))} /></label><label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, fontSize: 13, color: DARK }}><input type="checkbox" checked={receiptForm.verified} onChange={(e) => setReceiptForm((f) => ({ ...f, verified: e.target.checked }))} /> I confirm this payment has been verified.</label><button type="submit" style={{ ...button, marginTop: 14 }} disabled={savingReceipt}>{savingReceipt ? <LoaderCircle size={15} /> : <Save size={15} />}{savingReceipt ? 'Recording payment...' : 'Record payment and create receipt'}</button></form>}
      </section>}
      <section style={panel}><Heading description="Print or save each saved receipt as PDF.">Receipt history</Heading><label style={{ ...label, maxWidth: 420, marginBottom: 14 }}>Search receipts<input style={input} value={receiptSearch} onChange={(e) => setReceiptSearch(e.target.value)} placeholder="Receipt reference, customer or payment ref" /></label>{filteredReceipts.length ? <div style={{ overflowX: 'auto' }}><table style={table}><thead><tr>{['Receipt', 'Customer', 'Invoice', 'Amount received', 'Date', 'Method', 'Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{filteredReceipts.map((r) => { const inv = invoices.find((i) => i.id === r.invoice_id); return <tr key={r.id}><td style={td}><strong>{r.receipt_ref || '—'}</strong></td><td style={td}>{r.customer_name || '—'}</td><td style={td}>{inv?.invoice_ref || '—'}</td><td style={td}>{money(r.amount_received)}</td><td style={td}>{dateLabel(r.payment_date)}</td><td style={td}>{String(r.payment_method || '').replaceAll('_', ' ')}</td><td style={td}><button type="button" style={smallButton} onClick={() => printReceipt(r)}>Download / Print PDF</button></td></tr> })}</tbody></table></div> : <p style={{ color: MUTED, fontSize: 13 }}>No receipts recorded yet.</p>}</section>
    </>}
    <footer style={{ textAlign: 'center', color: MUTED, fontSize: 11, padding: '8px 0' }}>Opet Realms · Staff dashboard</footer>
  </div></main>
}
