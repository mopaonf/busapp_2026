import { FaArrowRight } from 'react-icons/fa6';
import SectionCard from '../components/dashboard/SectionCard';
import StatCard from '../components/dashboard/StatCard';
import {
   busStatus,
   recentBookings,
   summaryCards,
   upcomingDepartures,
} from '../data/dashboardData';

function DashboardHome() {
   return (
      <div className="space-y-6">
         <section>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
               <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                     Agency overview
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)] sm:text-base">
                     A professional control center for fleet visibility,
                     bookings, routes, and upcoming trips.
                  </p>
               </div>

               <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)]"
               >
                  View reports <FaArrowRight />
               </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
               {summaryCards.map((card, index) => (
                  <StatCard
                     key={card.label}
                     label={card.label}
                     value={card.value}
                     note={card.note}
                     tone={
                        index % 3 === 0
                           ? 'info'
                           : index % 3 === 1
                             ? 'success'
                             : 'warning'
                     }
                  />
               ))}
            </div>
         </section>

         <section className="grid gap-6 xl:grid-cols-3">
            <SectionCard
               title="Recent Bookings"
               description="Latest reservations and their current status."
               className="xl:col-span-2"
            >
               <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                     <thead className="bg-[var(--color-background)] text-[var(--color-text-secondary)]">
                        <tr>
                           <th className="px-4 py-3 font-medium">Passenger</th>
                           <th className="px-4 py-3 font-medium">Route</th>
                           <th className="px-4 py-3 font-medium">Bus</th>
                           <th className="px-4 py-3 font-medium">Status</th>
                           <th className="px-4 py-3 font-medium">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                        {recentBookings.map((booking) => (
                           <tr key={`${booking.passenger}-${booking.route}`}>
                              <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">
                                 {booking.passenger}
                              </td>
                              <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                 {booking.route}
                              </td>
                              <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                 {booking.bus}
                              </td>
                              <td className="px-4 py-4">
                                 <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-[var(--color-success)] text-[var(--color-text-light)]' : 'bg-[var(--color-warning)] text-[var(--color-text-light)]'}`}
                                 >
                                    {booking.status}
                                 </span>
                              </td>
                              <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">
                                 {booking.amount}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </SectionCard>

            <SectionCard
               title="Bus Status Overview"
               description="Simple fleet status distribution for the agency."
            >
               <div className="space-y-4">
                  {busStatus.map((item) => (
                     <div
                        key={item.label}
                        className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-background)] px-4 py-3"
                     >
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                           {item.label}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                           {item.value}
                        </span>
                     </div>
                  ))}
               </div>
            </SectionCard>
         </section>

         <section className="grid gap-6 lg:grid-cols-2">
            <SectionCard
               title="Upcoming Departures"
               description="Trips scheduled to leave soon."
            >
               <div className="space-y-4">
                  {upcomingDepartures.map((trip) => (
                     <div
                        key={`${trip.time}-${trip.route}`}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
                     >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                           <div>
                              <p className="text-base font-semibold text-[var(--color-text-primary)]">
                                 {trip.route}
                              </p>
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                 {trip.bus}
                              </p>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="rounded-full bg-[var(--color-background)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
                                 {trip.time}
                              </span>
                              <span className="text-sm text-[var(--color-text-secondary)]">
                                 {trip.seats}
                              </span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </SectionCard>

            <SectionCard
               title="Recent Bookings Activity"
               description="Quick glance at the latest platform activity."
            >
               <div className="space-y-4">
                  {recentBookings.map((booking) => (
                     <div
                        key={`${booking.passenger}-activity`}
                        className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3"
                     >
                        <div>
                           <p className="font-medium text-[var(--color-text-primary)]">
                              {booking.passenger}
                           </p>
                           <p className="text-sm text-[var(--color-text-secondary)]">
                              {booking.route}
                           </p>
                        </div>
                        <span
                           className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-[var(--color-success)] text-[var(--color-text-light)]' : 'bg-[var(--color-warning)] text-[var(--color-text-light)]'}`}
                        >
                           {booking.status}
                        </span>
                     </div>
                  ))}
               </div>
            </SectionCard>
         </section>
      </div>
   );
}

export default DashboardHome;
