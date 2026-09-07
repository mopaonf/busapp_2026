import './App.css';

const heroStats = [
   { value: '28', label: 'Agencies onboarded' },
   { value: '412', label: 'Routes published' },
   { value: '98.6%', label: 'Payouts cleared on time' },
   { value: '24', label: 'Open reviews' },
];

const operations = [
   {
      tone: 'success',
      title: 'Verification queue',
      description: '3 new agency applications are ready for final approval.',
   },
   {
      tone: 'warning',
      title: 'Schedule changes',
      description:
         'Route updates from Moghamo and Vatican Express need review.',
   },
   {
      tone: 'info',
      title: 'Settlement health',
      description: 'Weekly payout reconciliation is still within SLA.',
   },
];

const watchlist = [
   {
      label: 'Finexs',
      detail: 'Verified today, documents archived, catalog is live.',
      tone: 'success',
   },
   {
      label: 'Moghamo',
      detail: 'Pending fare review for two premium departures.',
      tone: 'warning',
   },
   {
      label: 'Vatican Express',
      detail: 'Revenue audit scheduled for the afternoon window.',
      tone: 'info',
   },
];

function App() {
   return (
      <main className="page">
         <div className="shell">
            <header className="topbar">
               <div className="brand">
                  <div className="brand-mark">B</div>
                  <div className="brand-copy">
                     <span className="eyebrow">BusBy Admin</span>
                     <strong>Platform control room</strong>
                  </div>
               </div>
               <span className="status-chip info">Live network health</span>
            </header>

            <section className="panel hero" id="overview">
               <div className="hero-copy">
                  <span className="eyebrow">Multi-agency oversight</span>
                  <h1>
                     Keep every bus agency visible, compliant, and ready to
                     sell.
                  </h1>
                  <p>
                     BusBy gives the admin team one operating surface for
                     approvals, settlements, and route governance across Finexs,
                     Moghamo, Vatican Express, and every agency that joins next.
                  </p>

                  <div className="actions">
                     <a className="button primary" href="#operations">
                        Review queue
                     </a>
                     <a className="button secondary" href="#watchlist">
                        Open watchlist
                     </a>
                  </div>
               </div>

               <div className="hero-board" aria-label="Admin summary metrics">
                  <div className="metric-grid">
                     {heroStats.map((stat) => (
                        <article className="metric-card" key={stat.label}>
                           <strong>{stat.value}</strong>
                           <span>{stat.label}</span>
                        </article>
                     ))}
                  </div>
               </div>
            </section>

            <section className="section-grid" id="operations">
               <article className="panel">
                  <div className="panel-head">
                     <div>
                        <span className="eyebrow">Operations</span>
                        <h2>Priority signals</h2>
                     </div>
                     <span className="status-chip warning">
                        3 items need attention
                     </span>
                  </div>

                  <div className="stack">
                     {operations.map((item) => (
                        <div className="stack-item" key={item.title}>
                           <span className={`tag ${item.tone}`}>
                              {item.title}
                           </span>
                           <p>{item.description}</p>
                        </div>
                     ))}
                  </div>
               </article>

               <article className="panel" id="watchlist">
                  <div className="panel-head">
                     <div>
                        <span className="eyebrow">Watchlist</span>
                        <h2>Agency snapshot</h2>
                     </div>
                     <span className="status-chip success">
                        All core systems stable
                     </span>
                  </div>

                  <div className="stack">
                     {watchlist.map((item) => (
                        <div className="stack-item" key={item.label}>
                           <div className="stack-meta">
                              <strong>{item.label}</strong>
                              <span className={`tag ${item.tone}`}>
                                 {item.tone}
                              </span>
                           </div>
                           <p>{item.detail}</p>
                        </div>
                     ))}
                  </div>
               </article>

               <article className="panel">
                  <div className="panel-head">
                     <div>
                        <span className="eyebrow">Governance</span>
                        <h2>Today’s focus</h2>
                     </div>
                     <span className="status-chip info">Updated 8 min ago</span>
                  </div>

                  <div className="stack">
                     <div className="stack-item">
                        <span className="tag info">Policy</span>
                        <p>
                           Route publishing rules are synced for all approved
                           agencies.
                        </p>
                     </div>
                     <div className="stack-item">
                        <span className="tag warning">Audit</span>
                        <p>
                           Settlement export is queued for review before the
                           evening cycle.
                        </p>
                     </div>
                     <div className="stack-item">
                        <span className="tag success">Health</span>
                        <p>
                           Booking availability checks are passing across the
                           live catalog.
                        </p>
                     </div>
                  </div>
               </article>
            </section>

            <footer className="footer panel">
               <div>
                  <span className="eyebrow">BusBy design system</span>
                  <p>
                     Shared tokens, card rhythm, and status colors keep Admin,
                     Agency, and Client visually aligned.
                  </p>
               </div>
            </footer>
         </div>
      </main>
   );
}

export default App;
