
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Quote from './pages/Quote'
import Gallery from './pages/Gallery'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quote" element={<Quote />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />
      <Route
        path="/terms-and-conditions"
        element={<TermsConditions />}
      />
      <Route
        path="*"
        element={
          <main className="container section text-center">
            <h1>Page not found</h1>
            <p>Sorry, we couldn't find that page.</p>
            <a href="/" className="button button-primary">
              Return Home
            </a>
          </main>
        }
      />
    </Routes>
  )
}
