import { useEffect, useMemo, useState } from 'react';
import {
   FaChevronDown,
   FaFilter,
   FaMagnifyingGlass,
   FaPlus,
} from 'react-icons/fa6';
import SeatMapPreview from '../components/bus/SeatMapPreview';
import SectionCard from '../components/dashboard/SectionCard';
import { amenityOptions, busTypeProfiles } from '../data/dashboardData';
import { agencyRequest } from '../lib/agencyApi';

function BusManagementPage({ token }) {
   const [savedBuses, setSavedBuses] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [requestError, setRequestError] = useState('');
   const [busForm, setBusForm] = useState({ name: '', plate: '', driver: '' });
   const [isAddBusOpen, setIsAddBusOpen] = useState(false);
   const [busType, setBusType] = useState('Standard');
   const [isDoubleDecker, setIsDoubleDecker] = useState(false);
   const [selectedSeat, setSelectedSeat] = useState(1);
   const [seatCount, setSeatCount] = useState(40);
   const [seatLayoutPattern, setSeatLayoutPattern] = useState('2-2');
   const [selectedAmenities, setSelectedAmenities] = useState([
      'wifi',
      'ac',
      'charging',
   ]);

   // Fixed price increase markups (in FCFA) per bus tier
   const [tierMarkups, setTierMarkups] = useState({
      Standard: busTypeProfiles.Standard?.priceIncrease ?? 0,
      Classic: busTypeProfiles.Classic?.priceIncrease ?? 2000,
      VIP: busTypeProfiles.VIP?.priceIncrease ?? 5000,
   });
   const [sampleBaseFare, setSampleBaseFare] = useState(4000);
   const [pricingSaved, setPricingSaved] = useState(false);

   useEffect(() => {
      Promise.all([
         agencyRequest(token, '/buses'),
         agencyRequest(token, '/pricing'),
      ])
         .then(([busesData, pricingData]) => {
            setSavedBuses(busesData);
            setTierMarkups(pricingData.tierMarkups);
         })
         .catch((error) => setRequestError(error.message))
         .finally(() => setIsLoading(false));
   }, [token]);

   const handleCreateBus = async (event) => {
      event.preventDefault();
      try {
         const createdBus = await agencyRequest(token, '/buses', {
            method: 'POST',
            body: JSON.stringify({
               ...busForm,
               type: busType,
               capacity: effectiveSeatCount,
               status: 'Active',
               amenities: selectedAmenities,
               seatLayout: {
                  totalSeats: effectiveSeatCount,
                  seatsPerRow: effectiveSeatsPerRow,
                  layoutSections: parsedLayout.sections,
                  isDoubleDecker,
                  lowerDeck: {
                     seatCount: effectiveSeatCount,
                     startSeat: 1,
                     frontSeatCount: isDoubleDecker ? 2 : 1,
                  },
                  upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
               },
            }),
         });
         setSavedBuses((current) => [createdBus, ...current]);
         setBusForm({ name: '', plate: '', driver: '' });
         setIsAddBusOpen(false);
      } catch (error) {
         setRequestError(error.message);
      }
   };

   const handleUpdateBus = async (bus) => {
      try {
         const updatedBus = await agencyRequest(token, `/buses/${bus._id}`, {
            method: 'PATCH',
            body: JSON.stringify({
               status: bus.status === 'Active' ? 'Maintenance' : 'Active',
            }),
         });
         setSavedBuses((current) =>
            current.map((item) =>
               item._id === updatedBus._id ? updatedBus : item,
            ),
         );
      } catch (error) {
         setRequestError(error.message);
      }
   };

   const handleDeleteBus = async (busId) => {
      try {
         await agencyRequest(token, `/buses/${busId}`, { method: 'DELETE' });
         setSavedBuses((current) => current.filter((bus) => bus._id !== busId));
      } catch (error) {
         setRequestError(error.message);
      }
   };

   const handleMarkupChange = (tier, value) => {
      const numericValue = Math.max(0, Number(value) || 0);
      setTierMarkups((prev) => ({
         ...prev,
         [tier]: numericValue,
      }));
      setPricingSaved(false);
   };

   const handleSavePricing = async () => {
      try {
         const pricing = await agencyRequest(token, '/pricing', {
            method: 'PATCH',
            body: JSON.stringify({ tierMarkups }),
         });
         setTierMarkups(pricing.tierMarkups);
         setPricingSaved(true);
         setTimeout(() => setPricingSaved(false), 3000);
      } catch (error) {
         setRequestError(error.message);
      }
   };

   const busProfile = useMemo(() => busTypeProfiles[busType], [busType]);
   const parsedLayout = (() => {
      const values = seatLayoutPattern
         .split('-')
         .map((part) => Number(part.trim()))
         .filter((part) => Number.isFinite(part) && part > 0);

      const sections = values.length > 0 ? values : [2, 2];
      const seatsInPattern = sections.reduce((sum, value) => sum + value, 0);

      return {
         sections,
         seatsInPattern,
      };
   })();
   const minimumSeatCount = isDoubleDecker ? 4 : 2;
   const effectiveSeatCount = Math.max(minimumSeatCount, seatCount);
   const effectiveSeatsPerRow = Math.max(1, parsedLayout.seatsInPattern);
   const seatRows = Math.max(
      1,
      Math.ceil(effectiveSeatCount / effectiveSeatsPerRow),
   );

   const toggleAmenity = (amenityId) => {
      setSelectedAmenities((current) =>
         current.includes(amenityId)
            ? current.filter((item) => item !== amenityId)
            : [...current, amenityId],
      );
   };

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
         {isLoading ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
               Loading buses...
            </p>
         ) : null}
         <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center lg:justify-between">
            <div>
               <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Bus Management
               </p>
               <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  Manage buses & tier pricing
               </h1>
               <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Manage fleet inventory, seat layouts, and fixed tier price
                  additions.
               </p>
            </div>
         </section>

         {/* Tier Pricing Configuration Card */}
         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
               <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Pricing Rules
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
                     Bus Tier Price Increases (FCFA)
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                     Set fixed price additions for Standard and VIP buses added
                     on top of base route fares.
                  </p>
               </div>

               <div className="flex items-center gap-3">
                  {pricingSaved && (
                     <span className="rounded-md bg-[var(--color-success)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
                        Price rules updated!
                     </span>
                  )}
                  <button
                     type="button"
                     onClick={handleSavePricing}
                     className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-primary-hover)]"
                  >
                     Save Tier Markups
                  </button>
               </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
               {/* Standard Tier */}
               <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                     <span className="rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-secondary)]">
                        Standard Tier
                     </span>
                     <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                        Base Fare
                     </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
                     Standard Buses
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                     Uses exact base route price with zero added fare.
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                     <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Price Increase:
                     </span>
                     <span className="text-base font-bold text-[var(--color-text-primary)]">
                        +0 FCFA
                     </span>
                  </div>
               </div>

               {/* Classic Tier */}
               <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                     <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                        Classic Tier
                     </span>
                     <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                        Fixed Addition
                     </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
                     Classic Buses
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                     Fixed fare increase added to every classic bus schedule.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                     <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        +
                     </span>
                     <div className="relative flex-1">
                        <input
                           type="number"
                           step="500"
                           min="0"
                           value={tierMarkups.Classic}
                           onChange={(e) =>
                              handleMarkupChange('Classic', e.target.value)
                           }
                           className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                        />
                     </div>
                     <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        FCFA
                     </span>
                  </div>
               </div>

               {/* VIP Tier */}
               <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                     <span className="rounded-full bg-[var(--color-warning)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">
                        VIP Premium
                     </span>
                     <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                        Fixed Addition
                     </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
                     VIP Buses
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                     Premium fare increase added to luxury cabin schedules.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                     <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        +
                     </span>
                     <div className="relative flex-1">
                        <input
                           type="number"
                           step="500"
                           min="0"
                           value={tierMarkups.VIP}
                           onChange={(e) =>
                              handleMarkupChange('VIP', e.target.value)
                           }
                           className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                        />
                     </div>
                     <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        FCFA
                     </span>
                  </div>
               </div>
            </div>

            {/* Live Pricing Simulation Box */}
            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border)] pb-3">
                  <div>
                     <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Live Route Price Simulation
                     </p>
                     <p className="text-xs text-[var(--color-text-secondary)]">
                        See how total seat fare is calculated for a sample
                        route:
                     </p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                        Sample Base Fare:
                     </span>
                     <input
                        type="number"
                        step="500"
                        value={sampleBaseFare}
                        onChange={(e) =>
                           setSampleBaseFare(
                              Math.max(0, Number(e.target.value) || 0),
                           )
                        }
                        className="w-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] outline-none"
                     />
                     <span className="text-xs text-[var(--color-text-secondary)]">
                        FCFA
                     </span>
                  </div>
               </div>

               <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-center border border-[var(--color-border)]">
                     <span className="text-xs text-[var(--color-text-secondary)]">
                        Standard Trip Fare
                     </span>
                     <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                        {(
                           sampleBaseFare + (tierMarkups.Standard || 0)
                        ).toLocaleString()}{' '}
                        FCFA
                     </p>
                     <span className="text-[10px] text-[var(--color-text-secondary)]">
                        ({sampleBaseFare.toLocaleString()} + 0)
                     </span>
                  </div>

                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-center border border-[var(--color-accent)]/40">
                     <span className="text-xs text-[var(--color-accent)] font-semibold">
                        Classic Trip Fare
                     </span>
                     <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                        {(
                           sampleBaseFare + tierMarkups.Classic
                        ).toLocaleString()}{' '}
                        FCFA
                     </p>
                     <span className="text-[10px] text-[var(--color-text-secondary)]">
                        ({sampleBaseFare.toLocaleString()} +{' '}
                        {tierMarkups.Classic.toLocaleString()})
                     </span>
                  </div>

                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-center border border-[var(--color-warning)]/40">
                     <span className="text-xs text-[var(--color-warning)] font-semibold">
                        VIP Trip Fare
                     </span>
                     <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                        {(sampleBaseFare + tierMarkups.VIP).toLocaleString()}{' '}
                        FCFA
                     </p>
                     <span className="text-[10px] text-[var(--color-text-secondary)]">
                        ({sampleBaseFare.toLocaleString()} +{' '}
                        {tierMarkups.VIP.toLocaleString()})
                     </span>
                  </div>
               </div>
            </div>
         </section>

         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
               <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Add Bus
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                     Bus details and seat layout
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                     Set seat count and row pattern to match each bus exactly.
                  </p>
               </div>

               <button
                  type="button"
                  onClick={() => setIsAddBusOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)]"
               >
                  <FaChevronDown
                     className={`transition duration-300 ${isAddBusOpen ? 'rotate-180' : ''}`}
                  />{' '}
                  Add Bus
               </button>
            </div>

            <div
               className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isAddBusOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
               <div className="min-h-0 overflow-hidden border-t border-[var(--color-border)]">
                  <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                     <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                           <label className="grid gap-2 sm:col-span-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Bus name
                              </span>
                              <input
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                                 placeholder="e.g. Finexs 01"
                                 value={busForm.name}
                                 onChange={(event) =>
                                    setBusForm((current) => ({
                                       ...current,
                                       name: event.target.value,
                                    }))
                                 }
                              />
                           </label>

                           <label className="grid gap-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Plate number
                              </span>
                              <input
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                                 placeholder="CE-000-00"
                                 value={busForm.plate}
                                 onChange={(event) =>
                                    setBusForm((current) => ({
                                       ...current,
                                       plate: event.target.value,
                                    }))
                                 }
                              />
                           </label>

                           <label className="grid gap-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Driver
                              </span>
                              <input
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                                 placeholder="Assigned driver"
                                 value={busForm.driver}
                                 onChange={(event) =>
                                    setBusForm((current) => ({
                                       ...current,
                                       driver: event.target.value,
                                    }))
                                 }
                              />
                           </label>

                           <label className="grid gap-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Bus type
                              </span>
                              <select
                                 value={busType}
                                 onChange={(event) => {
                                    const nextBusType = event.target.value;
                                    const nextBusProfile =
                                       busTypeProfiles[nextBusType];
                                    const profileCapacity = Number.parseInt(
                                       nextBusProfile?.capacity,
                                       10,
                                    );
                                    const defaultPatternByRow = {
                                       2: '1-1',
                                       3: '2-1',
                                       4: '2-2',
                                       5: '2-3',
                                    };

                                    setBusType(nextBusType);
                                    setSelectedSeat(1);
                                    setSeatCount(
                                       Number.isFinite(profileCapacity)
                                          ? profileCapacity
                                          : 40,
                                    );
                                    setSeatLayoutPattern(
                                       defaultPatternByRow[
                                          nextBusProfile?.seatsPerRow
                                       ] ?? '2-2',
                                    );
                                 }}
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                              >
                                 {Object.keys(busTypeProfiles).map((type) => (
                                    <option key={type} value={type}>
                                       {type}
                                    </option>
                                 ))}
                              </select>
                           </label>

                           <label className="grid gap-2 sm:col-span-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Seat count
                              </span>
                              <input
                                 type="number"
                                 min="4"
                                 max="120"
                                 value={seatCount}
                                 onChange={(event) =>
                                    setSeatCount(
                                       Number(event.target.value) || 4,
                                    )
                                 }
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                              />
                           </label>

                           <label className="grid gap-2 sm:col-span-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Bus deck mode
                              </span>
                              <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                 <input
                                    type="checkbox"
                                    checked={isDoubleDecker}
                                    onChange={(event) => {
                                       const nextValue = event.target.checked;
                                       setIsDoubleDecker(nextValue);
                                       setSelectedSeat(1);
                                       setSeatCount((current) =>
                                          Math.max(
                                             nextValue ? 4 : 2,
                                             Number(current) || 0,
                                          ),
                                       );
                                    }}
                                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                 />
                                 Enable double decker
                              </label>
                           </label>

                           <label className="grid gap-2 sm:col-span-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Row pattern (use hyphen between seat blocks)
                              </span>
                              <input
                                 value={seatLayoutPattern}
                                 onChange={(event) =>
                                    setSeatLayoutPattern(event.target.value)
                                 }
                                 placeholder="Examples: 2-2, 2-1, 1-2-1, 2-3"
                                 className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                              />
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                 Each number is a seat block and each hyphen is
                                 an aisle. Example: 1-2-1 creates two aisles.
                              </p>
                           </label>

                           <label className="grid gap-2 sm:col-span-2">
                              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                 Capacity snapshot
                              </span>
                              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                 {effectiveSeatCount} seats mapped across{' '}
                                 {seatRows} rows with {effectiveSeatsPerRow}{' '}
                                 seats per row (
                                 {parsedLayout.sections.length - 1} aisles)
                              </div>
                           </label>
                        </div>

                        <div className="mt-6">
                           <div className="mb-3">
                              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                                 Amenities
                              </h3>
                              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                 Optional features the bus can provide.
                              </p>
                           </div>

                           <div className="grid gap-3 sm:grid-cols-2">
                              {amenityOptions.map((amenity) => (
                                 <label
                                    key={amenity.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)]"
                                 >
                                    <input
                                       type="checkbox"
                                       checked={selectedAmenities.includes(
                                          amenity.id,
                                       )}
                                       onChange={() =>
                                          toggleAmenity(amenity.id)
                                       }
                                       className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                    />
                                    <span>{amenity.label}</span>
                                 </label>
                              ))}
                           </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                           <button
                              type="button"
                              onClick={handleCreateBus}
                              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)]"
                           >
                              <FaPlus /> Save bus draft
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 setBusForm({ name: '', plate: '', driver: '' })
                              }
                              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                           >
                              Reset form
                           </button>
                        </div>
                     </section>

                     <SeatMapPreview
                        busType={busProfile}
                        totalSeats={effectiveSeatCount}
                        seatsPerRow={effectiveSeatsPerRow}
                        layoutSections={parsedLayout.sections}
                        isDoubleDecker={isDoubleDecker}
                        selectedSeat={selectedSeat}
                        onSeatSelect={setSelectedSeat}
                     />
                  </div>
               </div>
            </div>
         </section>

         <SectionCard
            title="Bus list"
            description="Search and filter buses before the first functional module is added."
         >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
               <label className="flex flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text-secondary)]">
                  <FaMagnifyingGlass />
                  <input
                     className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
                     placeholder="Search buses"
                     aria-label="Search buses"
                  />
               </label>

               <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-secondary)] lg:w-56">
                  <FaFilter />
                  <select
                     className="w-full bg-transparent outline-none"
                     aria-label="Filter bus status"
                  >
                     <option>All Statuses</option>
                     <option>Active</option>
                     <option>Maintenance</option>
                     <option>Inactive</option>
                  </select>
               </label>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
               <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                  <thead className="bg-[var(--color-background)] text-[var(--color-text-secondary)]">
                     <tr>
                        <th className="px-4 py-3 font-medium">Bus</th>
                        <th className="px-4 py-3 font-medium">Plate</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Capacity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                     {savedBuses.map((bus) => (
                        <tr key={bus._id}>
                           <td className="px-4 py-4 font-medium text-[var(--color-text-primary)]">
                              {bus.name}
                           </td>
                           <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                              {bus.plate}
                           </td>
                           <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                              {bus.type}
                           </td>
                           <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                              {bus.capacity} seats
                           </td>
                           <td className="px-4 py-4">
                              <span
                                 className={`rounded-full px-3 py-1 text-xs font-semibold ${bus.status === 'Active' ? 'bg-[var(--color-success)] text-[var(--color-text-light)]' : 'bg-[var(--color-warning)] text-[var(--color-text-light)]'}`}
                              >
                                 {bus.status}
                              </span>
                           </td>
                           <td className="px-4 py-4">
                              <button
                                 type="button"
                                 onClick={() => handleUpdateBus(bus)}
                                 className="text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-80"
                              >
                                 Update status
                              </button>
                              <button
                                 type="button"
                                 onClick={() => handleDeleteBus(bus._id)}
                                 className="ml-3 text-sm font-semibold text-[var(--color-danger)] transition hover:opacity-80"
                              >
                                 Delete
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

export default BusManagementPage;
