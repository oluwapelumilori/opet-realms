import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'

/* Mobile bottom navigation. Hidden on desktop by mobile.css.
   items:    [{ id, label, icon }]  (the same navItems the dashboards already build)
   active:   current section id
   onSelect: (id) => void           (same handler the top tabs use)
   fab:      optional { label, onClick } for the floating "+" button */
export default function MobileBottomNav({ items, active, onSelect, fab }) {
  const [moreOpen, setMoreOpen] = useState(false)
  if (!items.length) return null
  const overflow = items.length > 5
  const main = overflow ? items.slice(0, 4) : items
  const rest = overflow ? items.slice(4) : []
  const moreActive = rest.some((item) => item.id === active)

  function pick(id) { setMoreOpen(false); onSelect(id) }

  return <>
    {fab && <button type="button" className="opet-fab" aria-label={fab.label} onClick={fab.onClick}><Plus aria-hidden="true" /></button>}
    {moreOpen && <>
      <div className="opet-more-backdrop" onClick={() => setMoreOpen(false)} />
      <div className="opet-more-sheet" role="dialog" aria-label="More sections">
        {rest.map((item) => {
          const Icon = item.icon
          return <button type="button" key={item.id} aria-current={active === item.id ? 'page' : undefined} onClick={() => pick(item.id)}><Icon aria-hidden="true" /> {item.label}</button>
        })}
      </div>
    </>}
    <nav className="opet-bottom-nav" aria-label="Main navigation">
      {main.map((item) => {
        const Icon = item.icon
        return <button type="button" key={item.id} className="opet-bn-item" aria-current={active === item.id ? 'page' : undefined} onClick={() => pick(item.id)}><Icon aria-hidden="true" />{item.label}</button>
      })}
      {overflow && <button type="button" className="opet-bn-item" aria-expanded={moreOpen} aria-current={moreActive ? 'page' : undefined} onClick={() => setMoreOpen((v) => !v)}><Menu aria-hidden="true" />More</button>}
    </nav>
  </>
}
