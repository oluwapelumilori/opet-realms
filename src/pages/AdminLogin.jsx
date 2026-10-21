
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) throw loginError

      const user = data.user

      const { data: profile, error: profileError } = await supabase
        .from('staff_profiles')
        .select('id, full_name, role, is_active')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || !profile.is_active) {
        await supabase.auth.signOut()
        throw new Error(
          'Your account is not authorised to access the admin dashboard.'
        )
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError(
        err.message ||
          'Unable to sign in. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link to="/" className="admin-login-brand">
          Opet <span>Realms</span>
        </Link>

        <div className="admin-login-icon">
          <ShieldCheck size={28} />
        </div>

        <p className="admin-login-eyebrow">SECURE ADMIN PORTAL</p>
        <h1>Welcome back</h1>
        <p className="admin-login-description">
          Sign in to manage bookings, invoices and your team.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>
          <div className="admin-login-input">
            <Mail size={18} />
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <label htmlFor="admin-password">Password</label>
          <div className="admin-login-input">
            <LockKeyhole size={18} />
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in to dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <Link to="/" className="admin-login-back">
          Back to website
        </Link>
      </section>
    </main>
  )
}
