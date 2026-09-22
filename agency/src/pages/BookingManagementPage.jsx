import { useEffect, useState } from 'react';
import { FaBus, FaFilter, FaMagnifyingGlass } from 'react-icons/fa6';
import SectionCard from '../components/dashboard/SectionCard';
import { agencyRequest } from '../lib/agencyApi';

function BookingManagementPage({ token }) {
   const [buses, setBuses] = useState([]);
   const [selectedBusId, setSelectedBusId] = useState('');
   const [bookings, setBookings] = useState([]);
   const [search, setSearch] = useState('');
   const [statusFilter, setStatusFilter] = useState('All');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      Promise.all([
         agencyRequest(token, '/buses'),
         agencyRequest(token, '/bookings'),
      ])
         .then(([busData, bookingData]) => {
            const activeBuses = busData.filter(
               (bus) => bus.status === 'Active',
            );
            setBuses(activeBuses);
            setBookings(bookingData);
            setSelectedBusId(activeBuses[0]?._id || '');
         })
         .catch((requestError) => setError(requestError.message))
         .finally(() => setIsLoading(false));
   }, [token]);

   useEffect(() => {
      if (!selectedBusId) return;
      agencyRequest(token, `/bookings?busId=${selectedBusId}`)
         .then(setBookings)
         .catch((requestError) => setError(requestError.message));
   }, [token, selectedBusId]);

   const visibleBookings = bookings.filter((booking) => {
      const matchesStatus =
         statusFilter === 'All' || booking.paymentStatus === statusFilter;
      const text =
         `${booking.passenger?.name || ''} ${booking.passenger?.email || ''} ${booking.schedule?.routeId?.origin || ''} ${booking.schedule?.routeId?.destination || ''}`.toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
   });

   return (
      <div className="space-y-6">
         {error ? (
            <p
               className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
               role="alert"
            >
               {error}
            </p>
         ) : null}
         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
               Booking Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
               Passenger bookings
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
               Choose an active bus to review the passengers assigned to its
               trips.
            </p>
         </section>

         <SectionCard
            title="Bookings by active bus"
            description="Only buses currently active for booking are available here."
         >
            <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
               <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text-secondary)]">
                  <FaMagnifyingGlass />
                  <input
                     value={search}
                     onChange={(event) => setSearch(event.target.value)}
                     className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                     placeholder="Search passenger or route"
                  />
               </label>
               <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  <FaBus />
                  <select
                     value={selectedBusId}
                     onChange={(event) => setSelectedBusId(event.target.value)}
                     className="w-full bg-transparent outline-none"
                  >
                     <option value="">Select active bus</option>
                     {buses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                           {bus.name} · {bus.plate}
                        </option>
                     ))}
                  </select>
               </label>
               <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  <FaFilter />
                  <select
                     value={statusFilter}
                     onChange={(event) => setStatusFilter(event.target.value)}
                     className="w-full bg-transparent outline-none"
                  >
                     <option value="All">All payment states</option>
                     <option value="Completed">Completed</option>
                     <option value="Pending">Pending</option>
                     <option value="Failed">Failed</option>
                  </select>
               </label>
            </div>

            {isLoading ? (
               <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                  Loading bookings...
               </p>
            ) : null}
            {!isLoading && !buses.length ? (
               <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                  No active buses are available for booking.
               </p>
            ) : null}
            {!isLoading && buses.length && !selectedBusId ? (
               <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                  Select a bus to view its passengers.
               </p>
            ) : null}
            {!isLoading && selectedBusId ? (
               <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                     <thead className="bg-[var(--color-background)] text-[var(--color-text-secondary)]">
                        <tr>
                           <th className="px-4 py-3 font-medium">Passenger</th>
                           <th className="px-4 py-3 font-medium">Route</th>
                           <th className="px-4 py-3 font-medium">Seats</th>
                           <th className="px-4 py-3 font-medium">
                              Ticket fare
                           </th>
                           <th className="px-4 py-3 font-medium">
                              Test charge
                           </th>
                           <th className="px-4 py-3 font-medium">Payment</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                        {visibleBookings.map((booking) => (
                           <tr key={booking.id}>
                              <td className="px-4 py-4">
                                 <strong className="block text-[var(--color-text-primary)]">
                                    {booking.passenger?.name}
                                 </strong>
                                 <span className="text-xs text-[var(--color-text-secondary)]">
                                    {booking.passenger?.email}
                                 </span>
                              </td>
                              <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                 {booking.schedule?.routeId?.origin} →{' '}
                                 {booking.schedule?.routeId?.destination}
                              </td>
                              <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                 {booking.seats.join(', ')}
                              </td>
                              <td className="px-4 py-4 font-semibold text-[var(--color-text-primary)]">
                                 {booking.ticketAmount.toLocaleString()} FCFA
                              </td>
                              <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                                 {booking.gatewayAmount} FCFA
                              </td>
                              <td className="px-4 py-4">
                                 <span className="rounded-full bg-[var(--color-success)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                                    {booking.paymentStatus}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {!visibleBookings.length ? (
                     <p className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
                        No bookings found for this bus.
                     </p>
                  ) : null}
               </div>
            ) : null}
         </SectionCard>
      </div>
   );
}

export default BookingManagementPage;
