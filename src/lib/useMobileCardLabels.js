import { useEffect } from 'react'

/* Presentation only. After every render it adds class names and attributes
   to the dashboard's existing elements so mobile.css can restyle them.
   It never changes data, handlers or visible text, and has no effect on the
   desktop layout. */
export default function useMobileCardLabels() {
  useEffect(() => {
    const shell = document.querySelector('.opet-dashboard-shell')
    if (!shell) return

    // Section headings: stack the action button under the title
    shell.querySelectorAll('h2').forEach((h2) => {
      const titleBox = h2.parentElement
      const heading = titleBox?.parentElement
      if (heading?.parentElement?.tagName === 'SECTION') {
        heading.classList.add('opet-heading')
        titleBox.nextElementSibling?.classList.add('opet-heading-action')
      }
    })

    // Summary cards (icon + label + number)
    shell.querySelectorAll(':scope > div').forEach((div) => {
      if (div.querySelector(':scope > section > svg')) div.classList.add('opet-stat-grid')
    })

    // Booking stage cards
    shell.querySelectorAll('button[aria-pressed]').forEach((btn) => {
      btn.parentElement?.classList.add('opet-stage-grid')
      btn.classList.add('opet-stage-card')
      const name = btn.querySelector('span')?.textContent.trim().toLowerCase()
      if (name) btn.dataset.status = name
    })

    // Header buttons become icon-only on mobile, so keep their names for screen readers
    shell.querySelectorAll(':scope > header button').forEach((btn) => {
      if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', btn.textContent.trim())
    })

    // Staff management: password reset row
    shell.querySelectorAll('div > label + button').forEach((btn) => {
      if (btn.previousElementSibling?.querySelector('input[type="password"]')) btn.parentElement.classList.add('opet-reset-row')
    })

    // Tables become cards
    shell.querySelectorAll('table').forEach((table) => {
      const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim())
      const kind = heads.includes('Preferred date') ? 'bookings'
        : heads.includes('Valid until') ? 'quotes'
        : heads.includes('Balance') ? 'invoices'
        : heads.includes('Payment date') ? 'receipts'
        : 'picker'
      table.classList.add('opet-table')
      table.dataset.kind = kind
      table.parentElement?.classList.add('opet-table-wrap')
      table.querySelectorAll('tbody tr').forEach((tr) => {
        ;[...tr.children].forEach((td, i) => {
          const label = heads[i] || ''
          td.dataset.label = label
          if (i === 0) td.classList.add('opet-c-ref')
          if (label === 'Actions') td.classList.add(kind === 'bookings' ? 'opet-c-menu' : 'opet-c-action')
          if (label === '' && kind === 'picker') td.classList.add('opet-c-action')
          if (label === 'Status') {
            td.classList.add('opet-c-status')
            const select = td.querySelector('select')
            td.dataset.status = (select ? select.value : td.textContent).trim().toLowerCase()
          }
          if (label === 'Customer') td.dataset.initial = (td.textContent.trim().charAt(0) || '?').toUpperCase()
          if (label === 'Amount' || label === 'Amount received') td.classList.add('opet-c-amount')
        })
      })
    })
  })
}
