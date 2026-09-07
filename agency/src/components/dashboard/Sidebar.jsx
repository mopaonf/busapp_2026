import { FaChevronLeft } from 'react-icons/fa6';

function Sidebar({
   items,
   activePage,
   onNavigate,
   collapsed,
   onToggle,
   mobileOpen,
   onClose,
}) {
   return (
      <>
         {mobileOpen ? (
            <button
               type="button"
               aria-label="Close navigation"
               onClick={onClose}
               className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            />
         ) : null}

         <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
         >
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)]">
                     B
                  </div>
                  {!collapsed ? (
                     <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                           BusBy Agency
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                           SaaS dashboard
                        </p>
                     </div>
                  ) : null}
               </div>

               <button
                  type="button"
                  onClick={onToggle}
                  className="hidden rounded-[var(--radius-md)] border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:inline-flex"
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
               >
                  <FaChevronLeft
                     className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                  />
               </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
               <ul className="space-y-1">
                  {items.map((item) => {
                     const Icon = item.icon;
                     const isLogout = item.id === 'logout';
                     const isActive = item.id === activePage;

                     return (
                        <li key={item.id}>
                           <button
                              type="button"
                              onClick={() => onNavigate(item.id)}
                              className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-sm font-medium transition duration-300 ease-in-out ${isActive ? 'bg-[var(--color-primary)] text-[var(--color-text-light)] shadow-[var(--shadow-md)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background)]'} ${isLogout ? 'mt-4 text-[var(--color-danger)] hover:bg-[var(--color-background)]' : ''}`}
                           >
                              <Icon className="shrink-0 text-base" />
                              {!collapsed ? <span>{item.label}</span> : null}
                           </button>
                        </li>
                     );
                  })}
               </ul>
            </nav>

            {!collapsed ? (
               <div className="border-t border-[var(--color-border)] p-4">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-background)] p-4">
                     <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        Current agency
                     </p>
                     <p className="mt-2 font-semibold text-[var(--color-text-primary)]">
                        Finexs Group
                     </p>
                     <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Route publishing and fleet coordination are active.
                     </p>
                  </div>
               </div>
            ) : null}
         </aside>
      </>
   );
}

export default Sidebar;
