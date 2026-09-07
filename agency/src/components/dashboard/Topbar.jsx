import { FaBell, FaBars, FaCircleUser } from 'react-icons/fa6';

function Topbar({ agencyName, admin, onMenuClick }) {
   return (
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
         <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={onMenuClick}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:hidden"
                  aria-label="Open navigation"
               >
                  <FaBars />
               </button>

               <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                     {admin?.agencyName || agencyName}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                     Agency dashboard
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  aria-label="Notifications"
               >
                  <FaBell />
               </button>

               <button
                  type="button"
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-left transition hover:border-[var(--color-primary)]"
                  aria-label="User profile menu"
               >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-text-light)]">
                     A
                  </span>
                  <span className="hidden sm:block">
                     <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                        {admin?.displayName || 'Admin User'}
                     </span>
                     <span className="block text-xs text-[var(--color-text-secondary)]">
                        {admin?.username || 'Agency administrator'}
                     </span>
                  </span>
                  <FaCircleUser className="text-[var(--color-text-secondary)] sm:hidden" />
               </button>
            </div>
         </div>
      </header>
   );
}

export default Topbar;
