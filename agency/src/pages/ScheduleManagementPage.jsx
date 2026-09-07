import { useEffect, useMemo, useState } from 'react';
import {
   FaArrowRight,
   FaBus,
   FaCalendarDays,
   FaChevronDown,
   FaClock,
   FaFilter,
   FaPlus,
   FaRoute,
   FaChair,
   FaTrash,
} from 'react-icons/fa6';
import SectionCard from '../components/dashboard/SectionCard';
import { agencyRequest } from '../lib/agencyApi';

// Utility to parse time string "HH:MM" or float hours into total minutes
function parseHoursToMinutes(durationStrOrNum) {
   if (typeof durationStrOrNum === 'number') {
      return Math.round(durationStrOrNum * 60);
   }
   if (typeof durationStrOrNum === 'string') {
      const match = durationStrOrNum.match(/([\d.]+)/);
      if (match) {
         return Math.round(parseFloat(match[1]) * 60);
      }
   }
   return 180; // default 3 hours fallback
}

// Utility to compute arrival time given a takeoff "HH:MM" and duration hours/string
function calculateArrivalTime(takeoffTimeStr, durationHoursStrOrNum) {
   if (!takeoffTimeStr) return '--:--';
   const [hoursStr, minsStr] = takeoffTimeStr.split(':');
   const takeoffHours = parseInt(hoursStr, 10) || 0;
   const takeoffMins = parseInt(minsStr, 10) || 0;

   const durationMins = parseHoursToMinutes(durationHoursStrOrNum);
   const totalMins = takeoffHours * 60 + takeoffMins + durationMins;

   const arrivalHours = Math.floor(totalMins / 60) % 24;
   const arrivalMins = totalMins % 60;

   const paddedH = String(arrivalHours).padStart(2, '0');
   const paddedM = String(arrivalMins).padStart(2, '0');
   return `${paddedH}:${paddedM}`;
}

function timeToMinutes(time) {
   const [hours, minutes] = String(time || '')
      .split(':')
      .map(Number);
   return Number.isFinite(hours) && Number.isFinite(minutes)
      ? hours * 60 + minutes
      : null;
}

function schedulesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
   const start = timeToMinutes(firstStart);
   const end = timeToMinutes(firstEnd);
   const otherStart = timeToMinutes(secondStart);
   const otherEnd = timeToMinutes(secondEnd);
   return (
      start !== null &&
      end !== null &&
      otherStart !== null &&
      otherEnd !== null &&
      start < otherEnd &&
      end > otherStart
   );
}

function ScheduleManagementPage({ token }) {
   const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
   const [schedulesList, setSchedulesList] = useState([]);
   const [busesList, setBusesList] = useState([]);
   const [routesList, setRoutesList] = useState([]);
   const [statusFilter, setStatusFilter] = useState('All');
   const [requestError, setRequestError] = useState('');
   const [tierMarkups, setTierMarkups] = useState({
      Standard: 0,
      Classic: 2000,
      VIP: 5000,
   });

   // Form State
   const [selectedBusId, setSelectedBusId] = useState('');
   const [selectedRouteId, setSelectedRouteId] = useState('');
   const [departureDate, setDepartureDate] = useState('2026-07-30');
   const [takeoffTime, setTakeoffTime] = useState('08:00');

   // Selected Route details
   const selectedRouteObj = useMemo(
      () =>
         routesList.find((route) => route._id === selectedRouteId) ||
         routesList[0],
      [selectedRouteId, routesList],
   );

   const routeBaseFare = selectedRouteObj?.baseFare || 4000;
   const routeDuration = selectedRouteObj?.estimatedDuration || '3.5 hrs';

   const computedArrivalTime = calculateArrivalTime(takeoffTime, routeDuration);

   const normalizeSchedule = (schedule) => ({
      ...schedule,
      routeName: schedule.routeId?.name,
      origin: schedule.routeId?.origin,
      destination: schedule.routeId?.destination,
      busName: schedule.busId?.name,
      busType: schedule.busId?.type,
      capacity: schedule.busId?.capacity,
   });

   const availableBuses = useMemo(
      () =>
         busesList.filter((bus) => {
            if (bus.status !== 'Active') return false;
            return !schedulesList.some((schedule) => {
               const scheduleBusId = schedule.busId?._id || schedule.busId;
               return (
                  scheduleBusId === bus._id &&
                  schedule.date === departureDate &&
                  schedulesOverlap(
                     takeoffTime,
                     computedArrivalTime,
                     schedule.takeoffTime,
                     schedule.arrivalTime,
                  )
               );
            });
         }),
      [
         busesList,
         schedulesList,
         departureDate,
         takeoffTime,
         computedArrivalTime,
      ],
   );

   const selectedBusObj = useMemo(
      () =>
         availableBuses.find((bus) => bus._id === selectedBusId) ||
         availableBuses[0],
      [selectedBusId, availableBuses],
   );
   const busTierKey = selectedBusObj?.type || 'Standard';
   const busTierMarkup = tierMarkups[busTierKey] ?? 0;
   const busSeatCapacity = Number(selectedBusObj?.capacity) || 40;
   const calculatedTotalFare = routeBaseFare + busTierMarkup;

   useEffect(() => {
      Promise.all([
         agencyRequest(token, '/buses'),
         agencyRequest(token, '/routes'),
         agencyRequest(token, '/schedules'),
         agencyRequest(token, '/pricing'),
      ])
         .then(([busesData, routesData, schedulesData, pricingData]) => {
            setBusesList(busesData);
            setRoutesList(routesData);
            setSchedulesList(schedulesData.map(normalizeSchedule));
            setTierMarkups(pricingData.tierMarkups);
            setSelectedBusId((current) => current || busesData[0]?._id || '');
            setSelectedRouteId(
               (current) => current || routesData[0]?._id || '',
            );
         })
         .catch((error) => setRequestError(error.message));
   }, [token]);

   // Add Schedule Handler
   const handleCreateSchedule = async (e) => {
      e.preventDefault();
      if (!selectedBusObj || !selectedRouteObj) {
         setRequestError(
            'Create at least one bus and one route before scheduling a trip.',
         );
         return;
      }

      const newSchedule = {
         date: departureDate,
         takeoffTime,
         arrivalTime: computedArrivalTime,
         routeId: selectedRouteObj._id,
         busId: selectedBusObj._id,
         availableSeats: busSeatCapacity,
         baseFare: routeBaseFare,
         tierMarkup: busTierMarkup,
         totalFare: calculatedTotalFare,
         status: 'Published',
      };

      try {
         const createdSchedule = await agencyRequest(token, '/schedules', {
            method: 'POST',
            body: JSON.stringify(newSchedule),
         });
         setSchedulesList((prev) => [
            normalizeSchedule(createdSchedule),
            ...prev,
         ]);
         setIsAddScheduleOpen(false);
      } catch (error) {
         setRequestError(error.message);
      }
   };

   // Toggle Status Handler
   const handleToggleStatus = async (schedule) => {
      try {
         const updatedSchedule = await agencyRequest(
            token,
            `/schedules/${schedule._id}`,
            {
               method: 'PATCH',
               body: JSON.stringify({
                  status:
                     schedule.status === 'Published' ? 'Draft' : 'Published',
               }),
            },
         );
         const normalized = normalizeSchedule(updatedSchedule);
         setSchedulesList((prev) =>
            prev.map((item) =>
               item._id === normalized._id ? normalized : item,
            ),
         );
      } catch (error) {
         setRequestError(error.message);
      }
   };

   // Delete Schedule Handler
   const handleDeleteSchedule = async (id) => {
      try {
         await agencyRequest(token, `/schedules/${id}`, { method: 'DELETE' });
         setSchedulesList((prev) =>
            prev.filter((schedule) => schedule._id !== id),
         );
      } catch (error) {
         setRequestError(error.message);
      }
   };

   // Filtered Schedules
   const filteredSchedules = useMemo(() => {
      if (statusFilter === 'All') return schedulesList;
      return schedulesList.filter((s) => s.status === statusFilter);
   }, [schedulesList, statusFilter]);

   return (
      <div className="space-y-6">
         {requestError ? (
            <p
               className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
               role="alert"
            >
               {requestError}
            </p>
         ) : null}
         {/* Page Header */}
         <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center lg:justify-between">
            <div>
               <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Schedule Management
               </p>
               <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  Trip Schedules & Operations
               </h1>
               <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                  Assign registered buses to active route corridors, set takeoff
                  times with automatic arrival calculation, and compute total
                  ticket fares based on bus tiers.
               </p>
            </div>

            <button
               type="button"
               onClick={() => setIsAddScheduleOpen((val) => !val)}
               className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)]"
            >
               <FaChevronDown
                  className={`transition duration-300 ${isAddScheduleOpen ? 'rotate-180' : ''}`}
               />
               Add Schedule
            </button>
         </section>

         {/* Create Schedule Form Drawer / Section */}
         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
               <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Create Schedule
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                     Dispatch Bus & Route Schedule
                  </h2>
               </div>

               <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-background)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                  <FaCalendarDays /> Operations Planner
               </div>
            </div>

            <div
               className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isAddScheduleOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
               <div className="min-h-0 overflow-hidden border-t border-[var(--color-border)] p-6">
                  <form
                     onSubmit={handleCreateSchedule}
                     className="grid gap-6 xl:grid-cols-2"
                  >
                     {/* Left: Inputs (Bus, Route, Dates, Takeoff) */}
                     <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                           Assignment & Timing
                        </h3>

                        {/* Select Bus */}
                        <label className="grid gap-1.5">
                           <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                              <FaBus className="text-[var(--color-primary)] text-xs" />{' '}
                              Select Bus
                           </span>
                           <select
                              value={selectedBusObj?._id || ''}
                              onChange={(e) => setSelectedBusId(e.target.value)}
                              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                           >
                              {availableBuses.map((b) => (
                                 <option key={b._id} value={b._id}>
                                    {b.name} ({b.type} Tier - {b.capacity}) -{' '}
                                    {b.plate}
                                 </option>
                              ))}
                           </select>
                           <span className="text-xs text-[var(--color-text-secondary)]">
                              {availableBuses.length
                                 ? `${availableBuses.length} bus${availableBuses.length === 1 ? '' : 'es'} available for this time.`
                                 : 'No active buses are available for this date and time.'}
                           </span>
                        </label>

                        {/* Select Route */}
                        <label className="grid gap-1.5">
                           <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                              <FaRoute className="text-[var(--color-accent)] text-xs" />{' '}
                              Select Route Corridor
                           </span>
                           <select
                              value={selectedRouteId}
                              onChange={(e) =>
                                 setSelectedRouteId(e.target.value)
                              }
                              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                           >
                              {routesList.map((r) => (
                                 <option key={r._id} value={r._id}>
                                    {r.name} ({r.distance} - Base:{' '}
                                    {r.baseFare.toLocaleString()} FCFA)
                                 </option>
                              ))}
                           </select>
                        </label>

                        {/* Date & Takeoff Time */}
                        <div className="grid gap-3 sm:grid-cols-2 pt-1">
                           <label className="grid gap-1.5">
                              <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                                 <FaCalendarDays className="text-[var(--color-primary)] text-xs" />{' '}
                                 Departure Date
                              </span>
                              <input
                                 type="date"
                                 value={departureDate}
                                 onChange={(e) =>
                                    setDepartureDate(e.target.value)
                                 }
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                              />
                           </label>

                           <label className="grid gap-1.5">
                              <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                                 <FaClock className="text-[var(--color-primary)] text-xs" />{' '}
                                 Takeoff Time
                              </span>
                              <input
                                 type="time"
                                 value={takeoffTime}
                                 onChange={(e) =>
                                    setTakeoffTime(e.target.value)
                                 }
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                              />
                           </label>
                        </div>
                     </div>

                     {/* Right: Calculated Fare & Automatic Arrival Time Preview */}
                     <div className="space-y-4 flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                        <div>
                           <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                              Computed Schedule Specs
                           </h3>

                           {/* Automatic Arrival Calculation Box */}
                           <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                 Arrival Time Calculation
                              </span>
                              <div className="mt-2 flex items-center justify-between">
                                 <div>
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                       Takeoff:
                                    </span>
                                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                                       {takeoffTime}
                                    </p>
                                 </div>

                                 <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full">
                                       + {routeDuration}
                                    </span>
                                    <FaArrowRight className="text-xs text-[var(--color-text-secondary)] mt-1" />
                                 </div>

                                 <div className="text-right">
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                       Computed Arrival:
                                    </span>
                                    <p className="text-lg font-extrabold text-[var(--color-primary)]">
                                       {computedArrivalTime}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Ticket Fare Calculation Box */}
                           <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
                              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                 Calculated Seat Ticket Price
                              </span>

                              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                                 <span>
                                    Route Base Fare (
                                    {selectedRouteObj?.name || 'Select a route'}
                                    ):
                                 </span>
                                 <span className="font-semibold text-[var(--color-text-primary)]">
                                    {routeBaseFare.toLocaleString()} FCFA
                                 </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                                 <span>Bus Tier Markup ({busTierKey}):</span>
                                 <span className="font-semibold text-[var(--color-accent)]">
                                    +{busTierMarkup.toLocaleString()} FCFA
                                 </span>
                              </div>

                              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 text-sm">
                                 <span className="font-bold text-[var(--color-text-primary)]">
                                    Total Ticket Price:
                                 </span>
                                 <span className="text-base font-extrabold text-[var(--color-primary)]">
                                    {calculatedTotalFare.toLocaleString()} FCFA
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Submit Button */}
                        <button
                           type="submit"
                           disabled={
                              !selectedBusObj ||
                              !selectedRouteObj ||
                              !availableBuses.length
                           }
                           className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           <FaPlus /> Confirm & Publish Schedule
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </section>

         {/* Published Schedules Grid */}
         <SectionCard
            title="Published & Upcoming Schedules"
            description="All active departure schedules with takeoff/arrival times, assigned bus capacity, and seat fare calculations."
         >
            {/* Filter Bar */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-5">
               <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                  <FaFilter className="text-[var(--color-primary)]" /> Filter
                  Status:
               </div>

               <div className="flex items-center gap-2">
                  {['All', 'Published', 'Draft'].map((status) => (
                     <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                           statusFilter === status
                              ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]'
                              : 'bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                     >
                        {status}
                     </button>
                  ))}
               </div>
            </div>

            {/* Schedules Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
               {filteredSchedules.map((sch) => (
                  <article
                     key={sch._id}
                     className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary)]/40"
                  >
                     <div>
                        {/* Header: Date & Status Pill */}
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                 {sch._id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                 • {sch.date}
                              </span>
                           </div>

                           <button
                              type="button"
                              onClick={() => handleToggleStatus(sch)}
                              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                                 sch.status === 'Published'
                                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] hover:bg-[var(--color-success)]/25'
                                    : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/25'
                              }`}
                           >
                              {sch.status}
                           </button>
                        </div>

                        {/* Takeoff -> Arrival Box */}
                        <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-background)] p-3 border border-[var(--color-border)]">
                           <div className="flex items-center justify-between">
                              <div>
                                 <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">
                                    Takeoff
                                 </span>
                                 <p className="text-base font-extrabold text-[var(--color-text-primary)]">
                                    {sch.takeoffTime}
                                 </p>
                              </div>

                              <div className="flex flex-col items-center">
                                 <FaArrowRight className="text-xs text-[var(--color-primary)]" />
                              </div>

                              <div className="text-right">
                                 <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">
                                    Arrival
                                 </span>
                                 <p className="text-base font-extrabold text-[var(--color-primary)]">
                                    {sch.arrivalTime}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Route Corridor & Bus info */}
                        <div className="mt-3 space-y-2">
                           <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                              <FaRoute className="text-[var(--color-accent)] text-xs" />
                              {sch.routeName}
                           </div>

                           <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                              <span className="flex items-center gap-1">
                                 <FaBus className="text-[var(--color-primary)] text-xs" />{' '}
                                 {sch.busName}
                              </span>
                              <span
                                 className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                    sch.busType === 'VIP'
                                       ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
                                       : sch.busType === 'Classic'
                                         ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                         : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                                 }`}
                              >
                                 {sch.busType} Tier
                              </span>
                           </div>

                           <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                              <span className="flex items-center gap-1">
                                 <FaChair className="text-xs" /> Seats
                                 Available:
                              </span>
                              <span className="font-bold text-[var(--color-text-primary)]">
                                 {sch.availableSeats} / {sch.capacity}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Card Footer: Calculated Price & Actions */}
                     <div className="mt-4 border-t border-[var(--color-border)] pt-3 flex items-center justify-between">
                        <div>
                           <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">
                              Seat Fare
                           </span>
                           <p className="text-base font-extrabold text-[var(--color-primary)]">
                              {sch.totalFare.toLocaleString()} FCFA
                           </p>
                        </div>

                        <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onClick={() => handleDeleteSchedule(sch._id)}
                              className="rounded-[var(--radius-sm)] p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                              title="Delete Schedule"
                           >
                              <FaTrash />
                           </button>
                        </div>
                     </div>
                  </article>
               ))}
            </div>
         </SectionCard>
      </div>
   );
}

export default ScheduleManagementPage;
