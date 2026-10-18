
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <Link to="/" className="button button-outline">
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <span className="eyebrow">Your privacy matters</span>
          <h1>Privacy Policy</h1>

          <p>
            How Opet Realms collects, uses and protects your
            personal information.
          </p>

          <p>
            <small>Last updated: October 2026</small>
          </p>
        </div>
      </header>

      <main className="section">
        <article className="container legal-content">
          <h2>1. Introduction</h2>
          <p>
            Opet Realms provides cleaning, fumigation and garment-care
            services across Lagos Mainland and Lagos Island. This
            policy explains how we handle personal information when
            you visit our website or contact us about our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>Depending on how you interact with us, we may collect:</p>
          <ul>
            <li>Your name and telephone number.</li>
            <li>Your email address, if you provide one.</li>
            <li>Your service location and property details.</li>
            <li>Your preferred service date and requested services.</li>
            <li>Garment selections, quantities and quote details.</li>
            <li>Additional information you choose to include in an enquiry.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We may use your information to:</p>
          <ul>
            <li>Respond to enquiries and prepare service quotations.</li>
            <li>Arrange appointments and coordinate requested services.</li>
            <li>Communicate with you about your enquiry.</li>
            <li>Maintain business records and prevent misuse of our forms.</li>
            <li>Meet applicable legal obligations.</li>
          </ul>

          <h2>4. How We Share Information</h2>
          <p>
            We do not sell your personal information. We may share
            relevant information with service providers that help
            operate our website and process enquiries, such as our
            database hosting provider, or where disclosure is required
            by law. We aim to limit such sharing to what is necessary.
          </p>

          <h2>5. Supabase and WhatsApp</h2>
          <p>
            Our website is intended to use Supabase to store quote
            enquiries. When this feature is activated, submitted
            information will be processed to manage your request.
          </p>
          <p>
            If you choose to continue to WhatsApp, your device will
            open a pre-filled message to our business number. Review
            that message before sending it. WhatsApp processes
            information under its own privacy terms.
          </p>

          <h2>6. Data Security and Retention</h2>
          <p>
            We intend to use reasonable technical and organisational
            safeguards to protect personal information. We retain
            information only for as long as reasonably necessary for
            the purposes described in this policy, including applicable
            recordkeeping requirements.
          </p>
          <p>
            No website or electronic storage system can be guaranteed
            completely secure.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            Subject to applicable law, you may have rights to request
            access to, correction of or deletion of your personal
            information, or to object to certain processing. You may
            contact us to make a privacy request.
          </p>

          <h2>8. Cookies and Website Analytics</h2>
          <p>
            The website may use essential technical storage or
            analytics tools if these are configured. This policy
            should be updated if additional tracking or advertising
            technologies are introduced.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our website and services are intended for people who can
            make service enquiries on their own behalf or with
            appropriate adult authority. Please do not submit
            unnecessary personal information about children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy when our services, technology
            or legal obligations change. The latest version will be
            published on this page with an updated date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For questions or requests relating to privacy, contact
            Opet Realms:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:opetrealms@gmail.com">
                opetrealms@gmail.com
              </a>
            </li>
            <li>
              Phone:{' '}
              <a href="tel:+2347079079235">
                +234 707 907 9235
              </a>
            </li>
            <li>
              Address: 12 Wulemtu Ajoke Street, Akoka, Bariga, Lagos.
            </li>
          </ul>

          <p className="muted">
            This is a draft for website development, not legal advice.
            Review it against your actual data practices and applicable
            Nigerian data protection requirements before publication.
          </p>
        </article>
      </main>
    </>
  )
}
