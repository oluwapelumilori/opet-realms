
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsConditions() {
  return (
    <>
      <header className="page-header legal-page-header">
        <div className="container legal-header-content">
          <Link
            to="/"
            className="button button-outline legal-back-button"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <div className="legal-header-copy">
            <span className="eyebrow">
              Please read carefully
            </span>

            <h1>Terms &amp; Conditions</h1>

            <p>
              The terms governing enquiries, quotations and
              services provided by Opet Realms.
            </p>

            <p className="legal-updated">
              <small>Last updated: October 2026</small>
            </p>
          </div>
        </div>
      </header>

      <main className="section legal-page">
        <article className="container legal-content">
          <h2>1. About Opet Realms</h2>
          <p>
            Opet Realms provides cleaning, fumigation,
            garment-care and related services across Lagos
            Mainland and Lagos Island, Nigeria.
          </p>

          <h2>2. Requests for Quotes</h2>
          <p>
            Submitting a quote request through our website is
            an enquiry, not a confirmed booking. We may contact
            you to clarify your requirements, assess the property
            or garments, and provide a final quotation.
          </p>
          <p>
            Please provide accurate contact details, service
            locations and descriptions of the work required.
          </p>

          <h2>3. Prices and Estimates</h2>
          <p>
            Prices displayed on the website are starting prices
            or estimates unless expressly stated otherwise.
            Final charges may depend on property size, garment
            type, fabric condition, treatment requirements,
            accessibility and the scope of work.
          </p>
          <p>
            Laundry prices displayed against individual garments
            are indicative of the listed item and quantity.
            Additional charges, if applicable, should be
            communicated and agreed upon before the service
            proceeds.
          </p>

          <h2>4. Booking Confirmation</h2>
          <p>
            A submitted form or generated reference number does
            not by itself confirm an appointment. A booking is
            confirmed only when Opet Realms communicates
            acceptance and agrees on the relevant service
            details and schedule.
          </p>
          <p>
            If you continue to WhatsApp after submitting an
            enquiry, you must review and send the prepared
            message yourself. Opening WhatsApp alone does not
            mean the message has been sent or that a booking
            has been accepted.
          </p>

          <h2>5. Service Locations and Scheduling</h2>
          <p>
            Services are offered subject to availability and
            coverage. Customers should provide the correct
            service address and preferred date. Appointment
            times may need to be adjusted by mutual agreement.
          </p>

          <h2>6. Customer Responsibilities</h2>
          <p>Customers agree to:</p>
          <ul>
            <li>
              Provide accurate information about the requested service.
            </li>
            <li>
              Arrange reasonable access to the service location.
            </li>
            <li>
              Identify delicate fabrics, stains or special-care items.
            </li>
            <li>
              Secure valuables and communicate relevant safety concerns.
            </li>
            <li>
              Follow any reasonable preparation instructions
              provided by our team.
            </li>
          </ul>

          <h2>7. Laundry and Garment Care</h2>
          <p>
            Garments differ in fabric, construction, colourfastness
            and care requirements. Customers should disclose
            known defects, delicate embellishments and special
            cleaning instructions when submitting an enquiry.
          </p>
          <p>
            We will assess care requirements and communicate
            material concerns where reasonably practicable.
            No particular cleaning result can be guaranteed for
            every stain, fabric or pre-existing condition.
          </p>

          <h2>8. Cleaning and Fumigation</h2>
          <p>
            The scope of cleaning depends on the agreed service.
            Specialised cleaning, post-construction cleaning and
            fumigation may require an assessment before a final
            price and schedule can be confirmed.
          </p>
          <p>
            Customers must follow any safety, ventilation,
            evacuation, re-entry or preparation instructions
            communicated for a fumigation or pest-control
            treatment.
          </p>

          <h2>9. Payments and Additional Work</h2>
          <p>
            The payment amount, accepted payment method and
            payment timing will be communicated when the
            quotation is provided or the booking is confirmed.
            Additional work outside the agreed scope should
            be discussed and approved before it is undertaken.
          </p>

          <h2>10. Cancellations and Rescheduling</h2>
          <p>
            Please contact us as early as possible if you need
            to cancel or reschedule an appointment. Any
            applicable cancellation charges, deposits or refund
            arrangements must be communicated and agreed upon
            as part of the booking terms, subject to applicable law.
          </p>

          <h2>11. Complaints and Service Concerns</h2>
          <p>
            If you have concerns about a completed service,
            contact us promptly with your booking reference
            and details of the issue. We will review the
            concern and discuss an appropriate resolution.
          </p>

          <h2>12. Liability</h2>
          <p>
            Nothing in these terms excludes or limits any
            liability or consumer right that cannot lawfully
            be excluded or limited under applicable Nigerian
            law. Any other limitations must be consistent
            with applicable law and the specific service
            agreement.
          </p>

          <h2>13. Website Information</h2>
          <p>
            We aim to keep website information accurate and
            current, but service descriptions, availability,
            photographs and indicative prices may change.
            Illustrative photographs should not be understood
            as guaranteed results for a particular property
            or garment.
          </p>

          <h2>14. Privacy</h2>
          <p>
            Personal information submitted through our website
            is handled in accordance with our Privacy Policy.
          </p>
          <p>
            <Link to="/privacy-policy">
              Read our Privacy Policy
            </Link>
          </p>

          <h2>15. Changes to These Terms</h2>
          <p>
            We may update these terms when our services or
            operating requirements change. The current version
            will be published on this page. Any confirmed
            booking remains subject to the terms agreed for
            that booking and applicable law.
          </p>

          <h2>16. Contact Us</h2>
          <p>
            For questions about these terms or our services,
            contact Opet Realms:
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

          <p className="muted legal-disclaimer">
            This page is a draft for development purposes, not
            legal advice. Review your actual payment, cancellation,
            refund and service policies before publishing the
            website.
          </p>
        </article>
      </main>
    </>
  )
}
