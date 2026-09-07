import { useEffect, useMemo, useState } from 'react';
import {
   FaArrowRight,
   FaArrowRightArrowLeft,
   FaChevronDown,
   FaClock,
   FaLocationDot,
   FaMapLocationDot,
   FaPlus,
   FaRoute,
   FaShield,
   FaTrash,
} from 'react-icons/fa6';
import {
   MapContainer,
   Marker,
   Polyline,
   TileLayer,
   Tooltip,
   useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SectionCard from '../components/dashboard/SectionCard';
import { agencyRequest } from '../lib/agencyApi';

const routeLocations = [
   {
      id: 'douala',
      label: 'Douala',
      lat: 4.0511,
      lng: 9.7679,
      region: 'Littoral',
   },
   {
      id: 'yaounde',
      label: 'Yaounde',
      lat: 3.848,
      lng: 11.5021,
      region: 'Centre',
   },
   {
      id: 'bamenda',
      label: 'Bamenda',
      lat: 5.9631,
      lng: 10.1591,
      region: 'North West',
   },
   {
      id: 'bafoussam',
      label: 'Bafoussam',
      lat: 5.4698,
      lng: 10.4225,
      region: 'West',
   },
   { id: 'buea', label: 'Buea', lat: 4.156, lng: 9.231, region: 'South West' },
   {
      id: 'kumba',
      label: 'Kumba',
      lat: 4.6364,
      lng: 9.4469,
      region: 'South West',
   },
   {
      id: 'limbe',
      label: 'Limbe',
      lat: 4.0221,
      lng: 9.2035,
      region: 'South West',
   },
   {
      id: 'kribi',
      label: 'Kribi',
      lat: 2.9372,
      lng: 9.9077,
      region: 'South',
   },
   {
      id: 'garoua',
      label: 'Garoua',
      lat: 9.3011,
      lng: 13.397,
      region: 'North',
   },
];

const mapCenter = [5.0, 10.5];

// Calculate geographic distance in km using Haversine formula + road factor (~1.25)
function calculateAutoDistance(originObj, destinationObj) {
   if (!originObj || !destinationObj || originObj.id === destinationObj.id)
      return 0;
   const R = 6371;
   const dLat = ((destinationObj.lat - originObj.lat) * Math.PI) / 180;
   const dLon = ((destinationObj.lng - originObj.lng) * Math.PI) / 180;
   const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originObj.lat * Math.PI) / 180) *
         Math.cos((destinationObj.lat * Math.PI) / 180) *
         Math.sin(dLon / 2) *
         Math.sin(dLon / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   return Math.round(R * c * 1.25);
}

// Calculate estimated travel hours based on avg bus speed (~65 km/h)
function calculateAutoDuration(distanceKm) {
   if (!distanceKm || distanceKm <= 0) return 0;
   const hours = distanceKm / 65 + 0.5;
   return Math.round(hours * 10) / 10;
}

function RouteManagementPage({ token }) {
   const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
   const [originId, setOriginId] = useState('douala');
   const [destinationId, setDestinationId] = useState('yaounde');
   const [baseFare, setBaseFare] = useState(4500);
   const [publishedRoutes, setPublishedRoutes] = useState([]);
   const [requestError, setRequestError] = useState('');
   const [tierMarkups, setTierMarkups] = useState({
      Standard: 0,
      Classic: 2000,
      VIP: 5000,
   });

   useEffect(() => {
      Promise.all([
         agencyRequest(token, '/routes'),
         agencyRequest(token, '/pricing'),
      ])
         .then(([routesData, pricingData]) => {
            setPublishedRoutes(routesData);
            setTierMarkups(pricingData.tierMarkups);
         })
         .catch((error) => setRequestError(error.message));
   }, [token]);

   // Location Objects
   const originObj = useMemo(
      () =>
         routeLocations.find((loc) => loc.id === originId) || routeLocations[0],
      [originId],
   );
   const availableDestinationLocations = useMemo(() => {
      const usedDestinations = new Set(
         publishedRoutes
            .filter(
               (route) =>
                  route.origin?.toLowerCase() === originObj.label.toLowerCase(),
            )
            .map((route) => route.destination?.toLowerCase()),
      );

      return routeLocations.filter(
         (location) =>
            location.id !== originId &&
            !usedDestinations.has(location.label.toLowerCase()),
      );
   }, [originId, originObj, publishedRoutes]);
   const effectiveDestinationId = availableDestinationLocations.some(
      (location) => location.id === destinationId,
   )
      ? destinationId
      : availableDestinationLocations[0]?.id || '';
   const destinationObj = useMemo(
      () =>
         routeLocations.find((loc) => loc.id === effectiveDestinationId) ||
         originObj,
      [effectiveDestinationId, originObj],
   );

   const isValidRoute = Boolean(
      effectiveDestinationId && originId !== effectiveDestinationId,
   );

   // Auto-calculate distance and estimated duration
   const autoDistanceKm = useMemo(
      () => calculateAutoDistance(originObj, destinationObj),
      [originObj, destinationObj],
   );
   const autoDurationHours = useMemo(
      () => calculateAutoDuration(autoDistanceKm),
      [autoDistanceKm],
   );

   const routePath = useMemo(() => {
      if (!isValidRoute) return [];
      return [
         [originObj.lat, originObj.lng],
         [destinationObj.lat, destinationObj.lng],
      ];
   }, [isValidRoute, originObj, destinationObj]);

   // Swap Origin and Destination
   const handleSwapLocations = () => {
      setOriginId(destinationId);
      setDestinationId(originId);
   };

   // Add Route Handler
   const handleCreateRoute = async (e) => {
      e.preventDefault();
      if (!isValidRoute) return;

      const newRoute = {
         name: `${originObj.label} to ${destinationObj.label}`,
         origin: originObj.label,
         originRegion: originObj.region,
         destination: destinationObj.label,
         destinationRegion: destinationObj.region,
         baseFare: Number(baseFare) || 0,
         distance: `${autoDistanceKm} km`,
         estimatedDuration: `${autoDurationHours} hrs`,
         status: 'Active',
         schedulesCount: 0,
      };

      try {
         const createdRoute = await agencyRequest(token, '/routes', {
            method: 'POST',
            body: JSON.stringify(newRoute),
         });
         setPublishedRoutes((prev) => [createdRoute, ...prev]);
         setIsAddRouteOpen(false);
      } catch (error) {
         setRequestError(error.message);
      }
   };

   // Toggle Status
   const handleToggleStatus = async (route) => {
      try {
         const updatedRoute = await agencyRequest(
            token,
            `/routes/${route._id}`,
            {
               method: 'PATCH',
               body: JSON.stringify({
                  status: route.status === 'Active' ? 'Inactive' : 'Active',
               }),
            },
         );
         setPublishedRoutes((prev) =>
            prev.map((item) =>
               item._id === updatedRoute._id ? updatedRoute : item,
            ),
         );
      } catch (error) {
         setRequestError(error.message);
      }
   };

   // Delete Route
   const handleDeleteRoute = async (routeId) => {
      try {
         await agencyRequest(token, `/routes/${routeId}`, { method: 'DELETE' });
         setPublishedRoutes((prev) =>
            prev.filter((route) => route._id !== routeId),
         );
      } catch (error) {
         setRequestError(error.message);
      }
   };

   const classicMarkup = tierMarkups.Classic ?? 0;
   const vipMarkup = tierMarkups.VIP ?? 0;

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
                  Route Management
               </p>
               <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  Agency Route Network
               </h1>
               <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                  Define 2-point Origin and Destination travel corridors,
                  configure base fares, and automatically calculate tiered
                  ticket prices for Standard, Classic, and VIP buses.
               </p>
            </div>

            <button
               type="button"
               onClick={() => setIsAddRouteOpen((value) => !value)}
               className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)]"
            >
               <FaChevronDown
                  className={`transition duration-300 ${isAddRouteOpen ? 'rotate-180' : ''}`}
               />
               Add Route
            </button>
         </section>

         {/* Add Route Form Drawer / Section */}
         <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
               <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Create Route
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                     Define route endpoints & base fare
                  </h2>
               </div>

               <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-background)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
                  <FaMapLocationDot /> Interactive Map
               </div>
            </div>

            <div
               className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isAddRouteOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
               <div className="min-h-0 overflow-hidden border-t border-[var(--color-border)] p-6">
                  <form
                     onSubmit={handleCreateRoute}
                     className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]"
                  >
                     {/* Left: Map Preview */}
                     <RouteMapCanvas
                        originObj={originObj}
                        destinationObj={destinationObj}
                        routePath={routePath}
                        isValidRoute={isValidRoute}
                     />

                     {/* Right: Route Configuration Form */}
                     <div className="space-y-5">
                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5 space-y-4">
                           <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                              Origin & Destination
                           </h3>

                           <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                              {/* From Dropdown */}
                              <label className="grid gap-1.5">
                                 <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                                    <FaLocationDot className="text-[var(--color-primary)] text-xs" />{' '}
                                    From (Origin)
                                 </span>
                                 <select
                                    value={originId}
                                    onChange={(e) =>
                                       setOriginId(e.target.value)
                                    }
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                                 >
                                    {routeLocations.map((loc) => (
                                       <option key={loc.id} value={loc.id}>
                                          {loc.label} ({loc.region})
                                       </option>
                                    ))}
                                 </select>
                              </label>

                              {/* Swap Button */}
                              <button
                                 type="button"
                                 onClick={handleSwapLocations}
                                 title="Swap Origin & Destination"
                                 className="mb-1 grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                              >
                                 <FaArrowRightArrowLeft className="text-sm" />
                              </button>

                              {/* To Dropdown */}
                              <label className="grid gap-1.5">
                                 <span className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                                    <FaLocationDot className="text-[var(--color-accent)] text-xs" />{' '}
                                    To (Destination)
                                 </span>
                                 <select
                                    value={effectiveDestinationId}
                                    onChange={(e) =>
                                       setDestinationId(e.target.value)
                                    }
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                                 >
                                    {availableDestinationLocations.map(
                                       (loc) => (
                                          <option key={loc.id} value={loc.id}>
                                             {loc.label} ({loc.region})
                                          </option>
                                       ),
                                    )}
                                 </select>
                                 {!availableDestinationLocations.length ? (
                                    <span className="text-xs font-medium text-[var(--color-danger)]">
                                       All destinations from {originObj.label}{' '}
                                       already have routes.
                                    </span>
                                 ) : null}
                              </label>
                           </div>

                           {!isValidRoute && (
                              <p className="text-xs font-medium text-[var(--color-danger)]">
                                 Origin and Destination cannot be the same city.
                              </p>
                           )}

                           {/* Base Fare & Auto Distance/Time Specs */}
                           <div className="grid gap-3 sm:grid-cols-3 pt-2">
                              <label className="grid gap-1.5 sm:col-span-1">
                                 <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                                    Base Route Fare (FCFA)
                                 </span>
                                 <input
                                    type="number"
                                    step="500"
                                    min="500"
                                    value={baseFare}
                                    onChange={(e) =>
                                       setBaseFare(
                                          Math.max(
                                             0,
                                             Number(e.target.value) || 0,
                                          ),
                                       )
                                    }
                                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                                 />
                              </label>

                              {/* Auto Distance Badge */}
                              <div className="grid gap-1.5">
                                 <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    Auto Distance
                                 </span>
                                 <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text-primary)]">
                                    <FaRoute className="text-[var(--color-primary)] text-xs" />
                                    {isValidRoute
                                       ? `${autoDistanceKm} km`
                                       : '--'}
                                 </div>
                              </div>

                              {/* Auto Est. Travel Time Badge */}
                              <div className="grid gap-1.5">
                                 <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    Auto Est. Duration
                                 </span>
                                 <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text-primary)]">
                                    <FaClock className="text-[var(--color-accent)] text-xs" />
                                    {isValidRoute
                                       ? `${autoDurationHours} hrs`
                                       : '--'}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Fare Breakdown Preview Across Tiers */}
                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                           <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                              Tier Price Calculation Preview
                           </p>
                           <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                              Calculated dynamically based on your agency tier
                              rules:
                           </p>

                           <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                              {/* Standard */}
                              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
                                 <span className="text-[11px] font-semibold text-[var(--color-secondary)]">
                                    Standard Bus
                                 </span>
                                 <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                                    {baseFare.toLocaleString()} FCFA
                                 </p>
                                 <span className="text-[10px] text-[var(--color-text-secondary)]">
                                    (Base + 0)
                                 </span>
                              </div>

                              {/* Classic */}
                              <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/40 bg-[var(--color-surface)] p-3 text-center">
                                 <span className="text-[11px] font-semibold text-[var(--color-accent)]">
                                    Classic Bus
                                 </span>
                                 <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                                    {(
                                       baseFare + classicMarkup
                                    ).toLocaleString()}{' '}
                                    FCFA
                                 </p>
                                 <span className="text-[10px] text-[var(--color-text-secondary)]">
                                    (Base + {classicMarkup.toLocaleString()})
                                 </span>
                              </div>

                              {/* VIP */}
                              <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-surface)] p-3 text-center">
                                 <span className="text-[11px] font-semibold text-[var(--color-warning)]">
                                    VIP Bus
                                 </span>
                                 <p className="mt-1 text-base font-extrabold text-[var(--color-text-primary)]">
                                    {(baseFare + vipMarkup).toLocaleString()}{' '}
                                    FCFA
                                 </p>
                                 <span className="text-[10px] text-[var(--color-text-secondary)]">
                                    (Base + {vipMarkup.toLocaleString()})
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                           <button
                              type="submit"
                              disabled={
                                 !isValidRoute ||
                                 !availableDestinationLocations.length
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <FaPlus /> Save & Publish Route
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </section>

         {/* Published Routes Section */}
         <SectionCard
            title="Published Route Corridors"
            description="Active 2-point origin to destination routes with standard base fares and dynamic tier price breakdowns."
         >
            <div className="grid gap-5 md:grid-cols-2">
               {publishedRoutes.map((route) => {
                  const standardFare = route.baseFare;
                  const classicFare = route.baseFare + classicMarkup;
                  const vipFare = route.baseFare + vipMarkup;

                  return (
                     <article
                        key={route._id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary)]/40"
                     >
                        {/* Header: Origin -> Destination */}
                        <div>
                           <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                              <div className="flex items-center gap-2">
                                 <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                    <FaRoute className="text-sm" />
                                 </div>
                                 <div>
                                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                       {route._id.slice(-6).toUpperCase()}
                                    </span>
                                    <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                       {route.origin}{' '}
                                       <FaArrowRight className="text-xs text-[var(--color-primary)]" />{' '}
                                       {route.destination}
                                    </h3>
                                 </div>
                              </div>

                              {/* Status Badge */}
                              <button
                                 type="button"
                                 onClick={() => handleToggleStatus(route)}
                                 className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                                    route.status === 'Active'
                                       ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] hover:bg-[var(--color-success)]/25'
                                       : 'bg-[var(--color-disabled)]/30 text-[var(--color-text-secondary)] hover:bg-[var(--color-disabled)]/50'
                                 }`}
                              >
                                 {route.status}
                              </button>
                           </div>

                           {/* Metadata Badges (Distance, Time, Regions) */}
                           <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2.5 py-1 font-medium border border-[var(--color-border)]">
                                 <FaRoute className="text-[10px]" />{' '}
                                 {route.distance || '245 km'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2.5 py-1 font-medium border border-[var(--color-border)]">
                                 <FaClock className="text-[10px]" />{' '}
                                 {route.estimatedDuration || '3.5 hrs'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2.5 py-1 font-medium border border-[var(--color-border)]">
                                 <FaShield className="text-[10px]" />{' '}
                                 {route.schedulesCount} trips
                              </span>
                           </div>

                           {/* Tier Price Pill Breakdown */}
                           <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                              <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                                 <span>Route Fare Breakdown</span>
                                 <span className="text-[11px] text-[var(--color-primary)] font-bold">
                                    Base: {standardFare.toLocaleString()} FCFA
                                 </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                 {/* Standard */}
                                 <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] p-2 text-center border border-[var(--color-border)]">
                                    <span className="block text-[10px] font-semibold text-[var(--color-text-secondary)]">
                                       Standard
                                    </span>
                                    <span className="block text-xs font-extrabold text-[var(--color-text-primary)]">
                                       {standardFare.toLocaleString()}
                                    </span>
                                 </div>

                                 {/* Classic */}
                                 <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] p-2 text-center border border-[var(--color-accent)]/40">
                                    <span className="block text-[10px] font-semibold text-[var(--color-accent)]">
                                       Classic
                                    </span>
                                    <span className="block text-xs font-extrabold text-[var(--color-text-primary)]">
                                       {classicFare.toLocaleString()}
                                    </span>
                                 </div>

                                 {/* VIP */}
                                 <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] p-2 text-center border border-[var(--color-warning)]/40">
                                    <span className="block text-[10px] font-semibold text-[var(--color-warning)]">
                                       VIP
                                    </span>
                                    <span className="block text-xs font-extrabold text-[var(--color-text-primary)]">
                                       {vipFare.toLocaleString()}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs">
                           <span className="text-[var(--color-text-secondary)]">
                              {route.originRegion} ➔ {route.destinationRegion}
                           </span>

                           <div className="flex items-center gap-2">
                              <button
                                 type="button"
                                 onClick={() => handleDeleteRoute(route._id)}
                                 className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]"
                                 title="Delete Route"
                              >
                                 <FaTrash />
                              </button>
                           </div>
                        </div>
                     </article>
                  );
               })}
            </div>
         </SectionCard>
      </div>
   );
}

function RouteMapCanvas({
   originObj,
   destinationObj,
   routePath,
   isValidRoute,
}) {
   return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex flex-col justify-between">
         <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
            <div>
               <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Route Corridor Map
               </p>
               <p className="text-xs text-[var(--color-text-secondary)]">
                  Direct connection line between {originObj.label} and{' '}
                  {destinationObj.label}
               </p>
            </div>
            <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">
               2-Point Route
            </span>
         </div>

         <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <MapContainer
               center={mapCenter}
               zoom={6}
               minZoom={5}
               maxZoom={9}
               scrollWheelZoom={false}
               className="h-[380px] w-full"
            >
               <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
               <RouteMapViewport
                  originObj={originObj}
                  destinationObj={destinationObj}
                  isValidRoute={isValidRoute}
               />
               {isValidRoute && (
                  <>
                     <Polyline
                        positions={routePath}
                        pathOptions={{
                           color: 'var(--color-primary)',
                           weight: 5,
                           opacity: 0.9,
                           lineCap: 'round',
                           lineJoin: 'round',
                        }}
                     />
                     <Marker
                        position={[originObj.lat, originObj.lng]}
                        icon={createRouteMarkerIcon({
                           label: originObj.label,
                           type: 'origin',
                        })}
                     >
                        <Tooltip
                           direction="top"
                           offset={[0, -12]}
                           opacity={1}
                           permanent
                        >
                           <span className="font-semibold">
                              {originObj.label} (From)
                           </span>
                        </Tooltip>
                     </Marker>
                     <Marker
                        position={[destinationObj.lat, destinationObj.lng]}
                        icon={createRouteMarkerIcon({
                           label: destinationObj.label,
                           type: 'destination',
                        })}
                     >
                        <Tooltip
                           direction="top"
                           offset={[0, -12]}
                           opacity={1}
                           permanent
                        >
                           <span className="font-semibold">
                              {destinationObj.label} (To)
                           </span>
                        </Tooltip>
                     </Marker>
                  </>
               )}
            </MapContainer>
         </div>
      </div>
   );
}

function RouteMapViewport({ originObj, destinationObj, isValidRoute }) {
   const map = useMap();

   useEffect(() => {
      if (!isValidRoute) {
         map.setView(mapCenter, 6, { animate: true });
         return;
      }

      const bounds = L.latLngBounds([
         [originObj.lat, originObj.lng],
         [destinationObj.lat, destinationObj.lng],
      ]);
      map.fitBounds(bounds.pad(0.3), { animate: true });
   }, [map, originObj, destinationObj, isValidRoute]);

   return null;
}

function createRouteMarkerIcon({ type }) {
   const isOrigin = type === 'origin';
   const bgColor = isOrigin ? 'var(--color-primary)' : 'var(--color-accent)';

   return L.divIcon({
      className: '',
      html: `
         <div style="
            display:grid;
            place-items:center;
            width:32px;
            height:32px;
            border-radius:9999px;
            border:2px solid #ffffff;
            background:${bgColor};
            color:#ffffff;
            box-shadow:var(--shadow-md);
            font-weight:700;
            font-size:11px;
         ">
            ${isOrigin ? 'A' : 'B'}
         </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
   });
}

export default RouteManagementPage;
