
import { Routes, Route, Link } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import Quote from './pages/Quote'
import Gallery from './pages/Gallery'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import AdminLogin from './pages/AdminLogin'
import AdminEntry from './pages/AdminEntry'

function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <PageLayout>
      <section className="container section text-center">
        <h1>Page not found</h1>
        <p>Sorry, we couldn't find that page.</p>
        <Link to="/" className="button button-primary">
          Return Home
        </Link>
      </section>
    </PageLayout>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/quote"
          element={
            <PageLayout>
              <Quote />
            </PageLayout>
          }
        />

        <Route
          path="/gallery"
          element={
            <PageLayout>
              <Gallery />
            </PageLayout>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <PageLayout>
              <PrivacyPolicy />
            </PageLayout>
          }
        />

        <Route
          path="/terms-and-conditions"
          element={
            <PageLayout>
              <TermsConditions />
            </PageLayout>
          }
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminEntry />}
        />

        <Route
          path="/staff"
          element={<AdminEntry />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
