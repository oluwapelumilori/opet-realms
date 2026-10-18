
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import BeforeAfter from '../components/BeforeAfter'
import HowItWorks from '../components/HowItWorks'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <Services />

        <BeforeAfter />

        <HowItWorks />

        <FAQ />

        <Contact />
      </main>

      <Footer />
    </>
  )
}
