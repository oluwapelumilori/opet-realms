const MAINLAND_AREAS = ['Ogudu', 'Magodo', 'Ketu', 'Ojota', 'Festac']

const ISLAND_AREAS = ['Sangotedo', 'Banana Island']

const groups = [
  { title: 'Lagos Mainland', areas: MAINLAND_AREAS },
  { title: 'Lagos Island', areas: ISLAND_AREAS },
]

export default function Coverage() {
  return (
    <section className="section coverage-section" id="coverage">
      <div className="container">
        <div className="section-heading section-heading-left">
          <span className="eyebrow">Coverage</span>
          <h2>Across Lagos Mainland &amp; Island</h2>
          <p>
            Based at 12 Wulemtu Ajoke Street, Akoka, Bariga, Lagos. Not
            listed? Ask us — we likely cover you.
          </p>
        </div>

        <div className="coverage-grid">
          {groups.map((group) => (
            <article className="coverage-card" key={group.title}>
              <h3>{group.title}</h3>

              <div className="coverage-chips">
                {group.areas.map((area) => (
                  <span className="coverage-chip" key={area}>
                    {area}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
