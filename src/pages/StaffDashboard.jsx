import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, FileText, LogOut, LayoutDashboard, LoaderCircle,
  RefreshCw, ShieldCheck, Save, Plus, Search, MessageCircle, X, Wallet,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Opet Realms brand palette: navy + cyan. Kept local to this page.
const NAVY = '#16365E'
const CYAN = '#21C9D0'
const DARK = '#172B3F'
const MUTED = '#667789'
const BORDER = '#DCE5ED'
const PAGE = '#F5F8FB'
const BOOKING_STATUSES = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
  { value: 'inspection', label: 'Inspection' }, { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
]
const noPermissions = { view_bookings: false, manage_bookings: false, view_invoices: false, manage_invoices: false }
const emptyBookingForm = { customer_name: '', phone: '', email: '', address: '', service: '', property_type: '', preferred_date: '', preferred_time: '', notes: '' }
const emptyInvoiceForm = { booking_id: '', customer_name: '', amount: '', description: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '', payment_terms: '', payment_option: 'full' }
const panel = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 16, minWidth: 0 }
const button = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 39, padding: '9px 13px', border: `1px solid ${NAVY}`, borderRadius: 8, background: NAVY, color: '#fff', fontWeight: 650, fontSize: 13, cursor: 'pointer' }
const input = { width: '100%', boxSizing: 'border-box', minHeight: 40, padding: '9px 11px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: DARK, font: 'inherit', fontSize: 14 }
const label = { display: 'grid', gap: 5, color: DARK, fontSize: 13, fontWeight: 600, minWidth: 0 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14 }
const table = { width: '100%', minWidth: 650, borderCollapse: 'collapse', fontSize: 13 }
const th = { padding: '11px 12px', textAlign: 'left', color: MUTED, background: '#F2F6FA', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', fontWeight: 700 }
const td = { padding: 12, borderBottom: `1px solid ${BORDER}`, verticalAlign: 'top' }

function normalizeStatus(status) {
  const value = String(status || 'new').trim().toLowerCase()
  return ({ pending: 'contacted', confirmed: 'booked' })[value] || value
}
function formatStatus(status) {
  const value = normalizeStatus(status)
  return BOOKING_STATUSES.find((s) => s.value === value)?.label || value.replaceAll('_', ' ')
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
function whatsappUrl(phone, message = '') {
  let number = String(phone || '').replace(/\D/g, '')
  if (!number) return ''
  if (number.startsWith('0')) number = `234${number.slice(1)}`
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
function StatusPill({ status }) {
  const value = String(status || 'unpaid').toLowerCase()
  const palette = value === 'paid' || value === 'completed' ? ['#DDF7F5', '#086B70'] : value === 'cancelled' ? ['#FDE8E8', '#9F2424'] : value === 'new' ? ['#E7F0FF', '#1D4ED8'] : ['#FFF4D6', '#92400E']
  return <span style={{ display: 'inline-block', borderRadius: 20, padding: '4px 9px', background: palette[0], color: palette[1], fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{formatStatus(status)}</span>
}
function Heading({ children, description, action }) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}><div><h2 style={{ margin: 0, fontSize: 17, lineHeight: 1.4, fontWeight: 750, color: DARK }}>{children}</h2>{description && <p style={{ color: MUTED, fontSize: 13, margin: '4px 0 0' }}>{description}</p>}</div>{action}</div>
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savingBooking, setSavingBooking] = useState(false)
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [staffName, setStaffName] = useState('Team member')
  const [permissions, setPermissions] = useState(noPermissions)
  const [bookings, setBookings] = useState([])
  const [invoices, setInvoices] = useState([])
  const [bankSettings, setBankSettings] = useState({ bank_name: '', account_name: '', account_number: '', default_invoice_notes: '', default_invoice_payment_terms: '' })
  const [activeSection, setActiveSection] = useState('overview')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bookingForm, setBookingForm] = useState(emptyBookingForm)
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)

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
      const { data: row, error: permissionError } = await supabase.from('staff_permissions').select('view_bookings, manage_bookings, view_invoices, manage_invoices').eq('staff_id', session.user.id).maybeSingle()
      if (permissionError) throw permissionError
      const granted = { view_bookings: Boolean(row?.view_bookings || row?.manage_bookings), manage_bookings: Boolean(row?.manage_bookings), view_invoices: Boolean(row?.view_invoices || row?.manage_invoices), manage_invoices: Boolean(row?.manage_invoices) }
      setPermissions(granted)
      const none = { data: [], error: null }
      const [br, ir, sr] = await Promise.all([
        granted.view_bookings ? supabase.from('bookings').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        granted.view_invoices ? supabase.from('invoices').select('*').order('created_at', { ascending: false }) : Promise.resolve(none),
        granted.manage_invoices ? supabase.from('business_settings').select('bank_name, account_name, account_number, default_invoice_notes').eq('id', 1).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ])
      if (br.error) throw br.error
      if (ir.error) throw ir.error
      setBookings(br.data || [])
      setInvoices(ir.data || [])
      if (!sr.error && sr.data) setBankSettings({ bank_name: sr.data.bank_name || '', account_name: sr.data.account_name || '', account_number: sr.data.account_number || '', default_invoice_notes: sr.data.default_invoice_notes || '', default_invoice_payment_terms: '' })
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
  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase()
    return bookings.filter((b) => {
      const statusMatch = bookingStatusFilter === 'all' || normalizeStatus(b.status) === bookingStatusFilter
      const text = [b.booking_ref, b.customer_name, b.phone, b.email, b.service, b.address].filter(Boolean).join(' ').toLowerCase()
      return statusMatch && (!q || text.includes(q))
    })
  }, [bookings, bookingStatusFilter, bookingSearch])
  const filteredInvoices = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase()
    return !q ? invoices : invoices.filter((i) => [i.invoice_ref, i.customer_name, i.status, i.notes].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [invoices, invoiceSearch])
  const navItems = useMemo(() => [
    (permissions.view_bookings || permissions.view_invoices) && { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    permissions.view_bookings && { id: 'bookings', label: 'Quotes & Bookings', icon: CalendarDays },
    permissions.view_invoices && { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
  ].filter(Boolean), [permissions])
  const currentSection = navItems.some((item) => item.id === activeSection) ? activeSection : navItems[0]?.id

  async function handleSignOut() {
    const { error: e } = await supabase.auth.signOut()
    if (e) { setError(e.message); return }
    navigate('/admin/login', { replace: true })
  }
  async function handleChangePassword(event) {
    event.preventDefault(); setError(''); setSuccess('')
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
  async function handleCreateBooking(event) {
    event.preventDefault(); setError(''); setSuccess('')
    if (!permissions.manage_bookings) { setError('You do not have permission to create bookings.'); return }
    setSavingBooking(true)
    try {
      const bookingRef = reference('OR')
      const payload = { ...bookingForm, booking_ref: bookingRef, status: 'new', preferred_date: bookingForm.preferred_date || null, preferred_time: bookingForm.preferred_time || null, email: bookingForm.email.trim() || null, notes: bookingForm.notes.trim() || null }
      const { error: e } = await supabase.from('bookings').insert(payload)
      if (e) throw e
      setBookingForm({ ...emptyBookingForm }); setBookingStatusFilter('all'); setBookingSearch(''); setShowBookingForm(false); setSuccess(`Booking ${bookingRef} created successfully.`); setActiveSection('bookings'); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create the booking.') }
    finally { setSavingBooking(false) }
  }
  async function updateBookingStatus(id, status) {
    setError(''); setSuccess('')
    if (!permissions.manage_bookings) { setError('You do not have permission to change booking status.'); return }
    try {
      const { error: e } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (e) throw e
      setSuccess(`Booking status updated to ${formatStatus(status)}.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update booking status.') }
  }
  function openStage(status) { setBookingStatusFilter(status); setActiveSection('bookings'); setError(''); setSuccess('') }
  function selectBookingForInvoice(booking) {
    setInvoiceForm((f) => ({ ...f, booking_id: booking.id, customer_name: booking.customer_name || '', description: [booking.service, booking.property_type].filter(Boolean).join(' — '), notes: bankSettings.default_invoice_notes || '', payment_terms: bankSettings.default_invoice_payment_terms || '' }))
    setShowInvoiceForm(true); setActiveSection('invoices'); setError(''); setSuccess('')
  }
  async function handleCreateInvoice(event) {
    event.preventDefault(); setError(''); setSuccess('')
    if (!permissions.manage_invoices) { setError('You do not have permission to create invoices.'); return }
    setSavingInvoice(true)
    try {
      const amount = Number(invoiceForm.amount)
      if (!invoiceForm.customer_name.trim()) throw new Error('Enter the customer name.')
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid invoice amount.')
      const invoiceRef = reference('INV')
      const deposit = invoiceForm.payment_option === 'deposit' ? Math.round(amount * 0.7 * 100) / 100 : amount
      const details = [invoiceForm.description.trim(), invoiceForm.notes.trim(), invoiceForm.payment_terms.trim() ? `Payment terms: ${invoiceForm.payment_terms.trim()}` : '', invoiceForm.payment_option === 'deposit' ? `70% deposit due: ${money(deposit)}. Balance: ${money(amount - deposit)}.` : '', bankSettings.bank_name ? `Bank: ${bankSettings.bank_name}` : '', bankSettings.account_name ? `Account name: ${bankSettings.account_name}` : '', bankSettings.account_number ? `Account number: ${bankSettings.account_number}` : ''].filter(Boolean).join('\n')
      const { error: e } = await supabase.from('invoices').insert({ invoice_ref: invoiceRef, booking_id: invoiceForm.booking_id || null, customer_name: invoiceForm.customer_name.trim(), amount, status: 'unpaid', issue_date: invoiceForm.issue_date || null, due_date: invoiceForm.due_date || null, notes: details })
      if (e) throw e
      setInvoiceForm({ ...emptyInvoiceForm, payment_terms: bankSettings.default_invoice_payment_terms || '' }); setShowInvoiceForm(false); setSuccess(`Invoice ${invoiceRef} created successfully.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not create the invoice. Check the invoice fields against your Supabase table.') }
    finally { setSavingInvoice(false) }
  }
  async function updateInvoiceStatus(id, status) {
    setError(''); setSuccess('')
    if (!permissions.manage_invoices) { setError('You do not have permission to change invoice status.'); return }
    try {
      const { error: e } = await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
      if (e) throw e
      setSuccess(`Invoice marked ${status}.`); await loadDashboard()
    } catch (err) { setError(err.message || 'Could not update invoice status.') }
  }

  function bookingStageCards() {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 10, marginBottom: 16 }}>{BOOKING_STATUSES.map((s) => {
      const active = currentSection === 'bookings' && bookingStatusFilter === s.value
      return <button key={s.value} type="button" onClick={() => openStage(s.value)} aria-pressed={active} style={{ ...panel, marginBottom: 0, textAlign: 'left', cursor: 'pointer', border: active ? `2px solid ${CYAN}` : `1px solid ${BORDER}`, padding: 13, background: active ? '#EAFBFC' : '#fff', color: DARK }}><span style={{ display: 'block', fontSize: 12, color: MUTED, marginBottom: 5 }}>{s.label}</span><strong style={{ fontSize: 23 }}>{bookingCounts[s.value]}</strong></button>
    })}</div>
  }
  function bookingsTable(rows) {
    if (!rows.length) return <p style={{ color: MUTED, fontSize: 13 }}>No bookings match your search.</p>
    return <div style={{ overflowX: 'auto' }}><table style={table}><thead><tr>{['Reference', 'Customer', 'Service / Property', 'Preferred date', 'Status', 'Actions'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{rows.map((b) => {
      const message = `Hello ${b.customer_name || ''}, we are contacting you about your Opet Realms booking ${b.booking_ref || ''} for ${b.service || 'our cleaning service'}.`
      const chat = whatsappUrl(b.phone, message)
      return <tr key={b.id}><td style={td}><strong>{b.booking_ref || '—'}</strong><div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{dateLabel(b.created_at?.slice(0, 10))}</div></td><td style={td}><strong>{b.customer_name || '—'}</strong><div style={{ color: MUTED, fontSize: 12 }}>{b.phone || '—'}</div>{b.email && <div style={{ color: MUTED, fontSize: 12 }}>{b.email}</div>}{b.address && <div style={{ color: MUTED, fontSize: 12, marginTop: 3 }}>{b.address}</div>}</td><td style={td}>{b.service || '—'}{b.property_type && <div style={{ color: MUTED, fontSize: 12 }}>{b.property_type}</div>}{b.notes && <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{b.notes}</div>}</td><td style={td}>{dateLabel(b.preferred_date)}{b.preferred_time && <div style={{ color: MUTED, fontSize: 12 }}>{b.preferred_time}</div>}</td><td style={td}>{permissions.manage_bookings ? <select aria-label={`Status for ${b.booking_ref || b.customer_name}`} value={normalizeStatus(b.status)} onChange={(e) => updateBookingStatus(b.id, e.target.value)} style={{ ...input, minWidth: 120, padding: '6px 8px', fontSize: 12 }}>{BOOKING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select> : <StatusPill status={b.status} />}</td><td style={td}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{chat && <a href={chat} target="_blank" rel="noreferrer" style={{ ...button, textDecoration: 'none', minHeight: 32, padding: '6px 9px', fontSize: 11, background: '#fff', color: NAVY }}><MessageCircle size={14} /> WhatsApp</a>}{permissions.manage_invoices && <button type="button" onClick={() => selectBookingForInvoice(b)} style={{ ...button, minHeight: 32, padding: '6px 9px', fontSize: 11, background: NAVY }}><FileText size={14} /> Invoice</button>}</div></td></tr>
    })}</tbody></table></div>
  }
  function invoicesTable(rows) {
    if (!rows.length) return <p style={{ color: MUTED, fontSize: 13 }}>No invoices found.</p>
    return <div style={{ overflowX: 'auto' }}><table style={table}><thead><tr>{['Invoice', 'Customer', 'Amount', 'Issue date', 'Due date', 'Status'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{rows.map((i) => <tr key={i.id}><td style={td}><strong>{i.invoice_ref || '—'}</strong>{i.booking_id && <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>Booking linked</div>}</td><td style={td}>{i.customer_name || '—'}</td><td style={td}>{money(i.amount)}</td><td style={td}>{dateLabel(i.issue_date)}</td><td style={td}>{dateLabel(i.due_date)}</td><td style={td}>{permissions.manage_invoices ? <select aria-label={`Payment status for ${i.invoice_ref || i.customer_name}`} value={String(i.status || 'unpaid').toLowerCase()} onChange={(e) => updateInvoiceStatus(i.id, e.target.value)} style={{ ...input, minWidth: 110, padding: '6px 8px', fontSize: 12 }}><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="pending">Pending</option></select> : <StatusPill status={i.status || 'unpaid'} />}</td></tr>)}</tbody></table></div>
  }

  if (loading) return <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: NAVY }}><div style={{ textAlign: 'center' }}><LoaderCircle size={30} /><p>Loading your dashboard...</p></div></main>
  const hasAccess = navItems.length > 0
  const unpaid = invoices.filter((i) => !['paid', 'completed'].includes(String(i.status || '').toLowerCase())).length
  const cards = [permissions.view_bookings && { label: 'Total bookings', value: bookings.length, icon: CalendarDays }, permissions.view_invoices && { label: 'Total invoices', value: invoices.length, icon: FileText }, permissions.view_invoices && { label: 'Unpaid invoices', value: unpaid, icon: Wallet }].filter(Boolean)

  return <main style={{ minHeight: '100vh', background: PAGE, color: DARK, padding: '20px 0 42px' }}><div style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto' }}>
    <header style={{ ...panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}><div><p style={{ color: NAVY, fontWeight: 800, fontSize: 11, letterSpacing: 1.2, margin: '0 0 3px' }}>OPET REALMS</p><h1 style={{ margin: 0, fontSize: 23, lineHeight: 1.3 }}>Staff Dashboard</h1><p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>Welcome back, {staffName}.</p></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" style={{ ...button, background: '#fff', color: NAVY }} onClick={() => { setShowPasswordForm((v) => !v); setError(''); setSuccess('') }}><ShieldCheck size={15} /> Change password</button><button type="button" style={{ ...button, background: '#fff', color: NAVY }} onClick={loadDashboard}><RefreshCw size={15} /> Refresh</button><button type="button" style={{ ...button, background: DARK, borderColor: DARK }} onClick={handleSignOut}><LogOut size={15} /> Sign out</button></div></header>
    {showPasswordForm && <section style={panel}><Heading description="Choose a new password for your staff login. Use at least 8 characters." action={<button type="button" onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword('') }} style={{ ...button, background: '#fff', color: NAVY }}><X size={15} /> Cancel</button>}>Change password</Heading><form onSubmit={handleChangePassword} style={grid}><label style={label}>New password<input style={input} type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label><label style={label}>Confirm new password<input style={input} type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label><div style={{ display: 'flex', alignItems: 'end' }}><button type="submit" style={button} disabled={savingPassword}>{savingPassword ? <LoaderCircle size={15} /> : <Save size={15} />}{savingPassword ? 'Updating password...' : 'Save new password'}</button></div></form></section>}
    {hasAccess && <nav aria-label="Staff sections" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>{navItems.map((item) => { const Icon = item.icon; const active = currentSection === item.id; return <button type="button" key={item.id} onClick={() => { setActiveSection(item.id); setError(''); setSuccess('') }} style={{ ...button, background: active ? NAVY : '#fff', color: active ? '#fff' : NAVY, borderColor: active ? NAVY : BORDER }}><Icon size={15} /> {item.label}</button> })}</nav>}
    {error && <div role="alert" style={{ ...panel, color: '#9F2424', borderColor: '#F0C7C7', background: '#FFF8F8', fontSize: 13 }}>{error}</div>}{success && <div role="status" style={{ ...panel, color: '#086B70', borderColor: '#B9E3E7', background: '#F0FCFC', fontSize: 13 }}>{success}</div>}
    {!hasAccess && !error && <section style={panel}><Heading description="Your account is active, but no sections have been assigned to you yet."><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={18} color={NAVY} /> No access yet</span></Heading><p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Ask an admin to turn on your permissions in Staff Management, then press Refresh.</p></section>}
    {currentSection === 'overview' && <>{cards.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 18 }}>{cards.map((c) => { const Icon = c.icon; return <section key={c.label} style={{ ...panel, marginBottom: 0 }}><Icon size={21} color={NAVY} /><p style={{ color: MUTED, margin: '8px 0 3px', fontSize: 12 }}>{c.label}</p><strong style={{ fontSize: 26 }}>{c.value}</strong></section> })}</div>}{permissions.view_bookings && <section style={panel}><Heading description="Select a stage to open bookings at that point in the workflow.">Booking stages</Heading>{bookingStageCards()}</section>}</>}
    {currentSection === 'bookings' && <><section style={panel}><Heading description="Choose a stage to filter bookings.">Booking stages</Heading>{bookingStageCards()}<div style={grid}><label style={label}>Filter by status<select style={input} value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}><option value="all">All bookings ({bookings.length})</option>{BOOKING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label} ({bookingCounts[s.value]})</option>)}</select></label><label style={label}>Search bookings<div style={{ position: 'relative' }}><Search size={16} style={{ position: 'absolute', top: 12, left: 11, color: MUTED }} /><input style={{ ...input, paddingLeft: 34 }} placeholder="Name, phone, reference, service..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} /></div></label></div></section>
      {permissions.manage_bookings && <section style={panel}><Heading description="Add a booking received by phone, WhatsApp, or another channel." action={<button type="button" style={button} onClick={() => setShowBookingForm((v) => !v)}>{showBookingForm ? <X size={15} /> : <Plus size={15} />}{showBookingForm ? 'Close form' : 'Create booking'}</button>}>Create a booking</Heading>{showBookingForm && <form onSubmit={handleCreateBooking}><div style={grid}>{[['Customer name *','customer_name','text'],['Phone *','phone','tel'],['Email','email','email'],['Service *','service','text'],['Property type / size','property_type','text'],['Preferred date','preferred_date','date'],['Preferred time','preferred_time','text'],['Address / area *','address','text']].map(([title,key,type]) => <label key={key} style={label}>{title}<input type={type} style={input} required={title.includes('*')} value={bookingForm[key]} onChange={(e) => setBookingForm((f) => ({ ...f, [key]: e.target.value }))} /></label>)}</div><label style={{ ...label, marginTop: 14 }}>Notes<textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))} /></label><button type="submit" style={{ ...button, marginTop: 14 }} disabled={savingBooking}>{savingBooking ? <LoaderCircle size={15} /> : <Plus size={15} />}{savingBooking ? 'Creating booking...' : 'Save booking'}</button></form>}</section>}
      <section style={panel}><Heading description={`${filteredBookings.length} booking(s) found.${permissions.manage_bookings ? '' : ' You have view-only access to bookings.'}`}>All bookings</Heading>{bookingsTable(filteredBookings)}</section></>}
    {currentSection === 'invoices' && <>{permissions.manage_invoices && <section style={panel}><Heading description="Create an invoice for an existing booking or enter a customer manually." action={<button type="button" style={button} onClick={() => setShowInvoiceForm((v) => !v)}>{showInvoiceForm ? <X size={15} /> : <Plus size={15} />}{showInvoiceForm ? 'Close form' : 'Create invoice'}</button>}>Create an invoice</Heading>{showInvoiceForm && <form onSubmit={handleCreateInvoice}><div style={grid}><label style={label}>Link to booking (optional)<select style={input} value={invoiceForm.booking_id} onChange={(e) => { const b = bookings.find((x) => x.id === e.target.value); setInvoiceForm((f) => ({ ...f, booking_id: e.target.value, customer_name: b?.customer_name || f.customer_name, description: b ? [b.service, b.property_type].filter(Boolean).join(' — ') : f.description })) }}><option value="">No linked booking / manual invoice</option>{bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_ref || 'Booking'} — {b.customer_name || 'Customer'}</option>)}</select></label><label style={label}>Customer name *<input style={input} required value={invoiceForm.customer_name} onChange={(e) => setInvoiceForm((f) => ({ ...f, customer_name: e.target.value }))} /></label><label style={label}>Invoice amount (₦) *<input type="number" min="1" step="0.01" style={input} required value={invoiceForm.amount} onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))} /></label><label style={label}>Payment option<select style={input} value={invoiceForm.payment_option} onChange={(e) => setInvoiceForm((f) => ({ ...f, payment_option: e.target.value }))}><option value="full">Full payment</option><option value="deposit">70% deposit + balance</option></select></label><label style={label}>Issue date<input type="date" style={input} value={invoiceForm.issue_date} onChange={(e) => setInvoiceForm((f) => ({ ...f, issue_date: e.target.value }))} /></label><label style={label}>Due date<input type="date" style={input} value={invoiceForm.due_date} onChange={(e) => setInvoiceForm((f) => ({ ...f, due_date: e.target.value }))} /></label><label style={label}>Service / description<input style={input} value={invoiceForm.description} onChange={(e) => setInvoiceForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Deep cleaning — 4-bedroom flat" /></label></div>{invoiceForm.payment_option === 'deposit' && Number(invoiceForm.amount) > 0 && <div style={{ background: '#EAFBFC', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginTop: 14, fontSize: 13 }}><strong>70% deposit:</strong> {money(Number(invoiceForm.amount) * .7)} <span style={{ margin: '0 12px', color: MUTED }}>·</span><strong>Remaining balance:</strong> {money(Number(invoiceForm.amount) * .3)}</div>}<label style={{ ...label, marginTop: 14 }}>Payment terms<textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={invoiceForm.payment_terms} onChange={(e) => setInvoiceForm((f) => ({ ...f, payment_terms: e.target.value }))} placeholder="Default invoice terms from Business Settings, if available" /></label><label style={{ ...label, marginTop: 14 }}>Invoice notes<textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={invoiceForm.notes} onChange={(e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional payment instructions or notes" /></label>{(bankSettings.bank_name || bankSettings.account_name || bankSettings.account_number) && <div style={{ background: '#F2F6FA', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 13, marginTop: 14, fontSize: 13, lineHeight: 1.8 }}><strong>Bank transfer details</strong>{bankSettings.bank_name && <div>{bankSettings.bank_name}</div>}{bankSettings.account_name && <div>Account name: {bankSettings.account_name}</div>}{bankSettings.account_number && <div>Account number: {bankSettings.account_number}</div>}</div>}<button type="submit" style={{ ...button, marginTop: 14 }} disabled={savingInvoice}>{savingInvoice ? <LoaderCircle size={15} /> : <Save size={15} />}{savingInvoice ? 'Creating invoice...' : 'Save invoice'}</button></form>}</section>}
      <section style={panel}><Heading description={permissions.manage_invoices ? 'Search invoices and update payment status when payment is confirmed.' : 'You have view-only access to invoices.'}>Invoices</Heading><label style={{ ...label, marginBottom: 14, maxWidth: 420 }}>Search invoices<input style={input} value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="Invoice reference or customer name" /></label>{invoicesTable(filteredInvoices)}</section></>}
    <footer style={{ textAlign: 'center', color: MUTED, fontSize: 11, padding: '8px 0' }}>Opet Realms · Staff dashboard</footer>
  </div></main>
}
