
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'auto',
        })
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, search, hash])

  return null
}
