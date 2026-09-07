import { FaFilter, FaMagnifyingGlass } from 'react-icons/fa6';
import SectionCard from '../components/dashboard/SectionCard';
import { bookings } from '../data/dashboardData';

function BookingManagementPage() {
   return (
      <div className="space-y-6">
         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
               Booking Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
               Booking table
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
               Placeholder tools for search, booking status filters, and booking
               review.
            </p>
         </section>

         <SectionCard
            title="Bookings"
            description="Search bookings before the first workflow is implemented."
         >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
               <label className="flex flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text-secondary)]">
                  <FaMagnifyingGlass />
                  <input
                     className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
                     placeholder="Search booking"
                     aria-label="Search bookings"
                  />
               </label>

               <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-secondary)] lg:w-56">
                  <FaFilter />
                  <select
                     className="w-full bg-transparent outline-none"
                     aria-label="Filter booking status"
                  >
                     <option>All Bookings</option>
                     <option>Confirmed</option>
                     <option>Pending</option>
                     <option>Cancelled</option>
                  </select>
               </label>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
               <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                  <thead className="bg-[var(--color-background)] text-[var(--color-text-secondary)]">
                     <tr>
                        <th className="px-4 py-3 font-medium">Booking ID</th>
                        <th className="px-4 py-3 font-medium">Passenger</th>
                        <th className="px-4 py-3 font-medium">Route</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                     {bookings.map((booking) => (
                        <tr key={booking.id}>
                           <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">
                              {booking.id}
                           </td>
                           <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                              {booking.passenger}
                           </td>
                           <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                              {booking.route}
                           </td>
                           <td className="px-4 py-4">
                              <span
                                 className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-[var(--color-success)] text-[var(--color-text-light)]' : booking.status === 'Pending' ? 'bg-[var(--color-warning)] text-[var(--color-text-light)]' : 'bg-[var(--color-danger)] text-[var(--color-text-light)]'}`}
                              >
                                 {booking.status}
                              </span>
                           </td>
                           <td className="px-4 py-4">
                              <button className="text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-80">
                                 View Booking
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </SectionCard>
      </div>
   );
}

export default BookingManagementPage;
