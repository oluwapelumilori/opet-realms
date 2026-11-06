import { useEffect } from 'react'

/* Presentation only. After every render it tags the dashboard tables so
   mobile.css can show each row as a card: header text becomes data-label,
   and a few helper classes/attributes are added. It never changes data,
   handlers or table content, and has no effect on the desktop layout. */
export default function useMobileCardLabels() {
  useEffect(() => {
    document.querySelectorAll('.opet-dashboard-shell table').forEach((table) => {
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
