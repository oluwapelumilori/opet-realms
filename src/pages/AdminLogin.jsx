
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
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
      // Sign in with Supabase Auth.
      const {
        data: loginData,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (loginError) {
        throw new Error(loginError.message)
      }

      const user = loginData.user

      if (!user) {
        throw new Error(
          'Sign-in did not return a user. Please try again.'
        )
      }

      // Fetch the profile belonging to this exact Auth user.
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('staff_profiles')
        .select('id, full_name, role, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error(
          'Admin profile lookup failed:',
          {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          }
        )

        throw new Error(
          `Could not verify your staff profile: ${profileError.message} (${profileError.code}).`
        )
      }

      if (!profile) {
        throw new Error(
          'No staff profile was found for this account. Please check that the staff profile ID matches your Supabase Auth UID.'
        )
      }

      if (!profile.is_active) {
        throw new Error(
          'Your staff account is inactive. Please contact the administrator.'
        )
      }

      if (profile.role !== 'admin') {
        throw new Error(
          'Your account does not have administrator access.'
        )
      }

      // Verification succeeded. Open the dashboard.
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('Admin login error:', err)

      // Clear the session if sign-in succeeded but
      // profile verification failed.
      await supabase.auth.signOut().catch((signOutError) => {
        console.error(
          'Unable to clear failed login session:',
          signOutError
        )
      })

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.'
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

        <p className="admin-login-eyebrow">
          SECURE ADMIN PORTAL
        </p>

        <h1>Welcome back</h1>

        <p className="admin-login-description">
          Sign in to manage bookings, invoices and your team.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">
            Email address
          </label>

          <div className="admin-login-input">
            <Mail size={18} />

            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <label htmlFor="admin-password">
            Password
          </label>

          <div className="admin-login-input">
            <LockKeyhole size={18} />

            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
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
            {loading
              ? 'Verifying account...'
              : 'Sign in to dashboard'}

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
