import { useEffect, useMemo, useState } from 'react';
import { getLocations, searchTrips } from '../lib/clientApi';
import './AvailableBusesPage.css';
import SiteHeader from '../components/layout/SiteHeader';
import Footer from '../components/layout/Footer';

const promoSlides = [
   {
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85',
      tag: 'BUSBY PLUS',
      title: 'Travel smarter, every time.',
      copy: 'Get exclusive fare alerts and trip updates straight to your phone.',
   },
   {
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
      tag: 'WEEKEND ESCAPE',
      title: 'A better way to get away.',
      copy: 'Discover flexible trips for the journeys that matter most.',
   },
   {
      image: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=85',
      tag: 'BOOK WITH EASE',
      title: 'Your seat is waiting.',
      copy: 'Compare trusted agencies and reserve your next journey in minutes.',
   },
];

function AvailableBusesPage({
   search,
   onSearch,
   onBack,
   onSelectTrip,
   passengerAuth,
   onPassengerAuthenticated,
   onPassengerLogout,
}) {
   const [filters, setFilters] = useState(search);
   const [agencyFilter, setAgencyFilter] = useState('all');
   const [typeFilter, setTypeFilter] = useState('all');
   const [maxFare, setMaxFare] = useState(12000);
   const [filtersOpen, setFiltersOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isTripsLoading, setIsTripsLoading] = useState(true);
   const [requestError, setRequestError] = useState('');
   const [trips, setTrips] = useState([]);
   const [locations, setLocations] = useState([]);
   const [activePromo, setActivePromo] = useState(0);

   useEffect(() => {
      const timer = window.setInterval(
         () => setActivePromo((current) => (current + 1) % promoSlides.length),
         5500,
      );
      return () => window.clearInterval(timer);
   }, []);

   useEffect(() => {
      searchTrips(filters)
         .then(setTrips)
         .catch((error) => setRequestError(error.message))
         .finally(() => setIsTripsLoading(false));
   }, [filters]);

   useEffect(() => {
      getLocations()
         .then(setLocations)
         .catch((error) => setRequestError(error.message));
   }, []);

   const agencies = useMemo(
      () => [
         ...new Map(
            trips.map((trip) => [
               trip.agency.name,
               {
                  id: trip.agency.name,
                  name: trip.agency.name,
                  rating: trip.agency.rating,
               },
            ]),
         ).values(),
      ],
      [trips],
   );
   const filteredTrips = useMemo(
      () =>
         trips
            .filter(
               (trip) =>
                  agencyFilter === 'all' || trip.agency.name === agencyFilter,
            )
            .filter(
               (trip) => typeFilter === 'all' || trip.bus.type === typeFilter,
            )
            .filter((trip) => trip.totalFare <= maxFare),
      [trips, agencyFilter, typeFilter, maxFare],
   );

   const updateFilter = (field, value) =>
      setFilters((current) => ({ ...current, [field]: value }));
   const resetFilters = () => {
      setAgencyFilter('all');
      setTypeFilter('all');
      setMaxFare(12000);
   };
   const swapLocations = () =>
      setFilters((current) => ({
         ...current,
         origin: current.destination,
         destination: current.origin,
      }));
   const handleSearch = (event) => {
      event.preventDefault();
      setIsLoading(true);
      window.setTimeout(() => {
         onSearch(filters);
         setIsLoading(false);
      }, 2000);
   };

   const handleSelectTrip = (trip) => {
      onSelectTrip(trip);
   };

   const filterPanel = (
      <aside className={`left-sidebar${filtersOpen ? ' is-open' : ''}`}>
         <div className="sidebar-title">
            <strong>Filter results</strong>
            <button type="button" onClick={resetFilters}>
               Reset
            </button>
            <button
               type="button"
               className="mobile-filter-close"
               aria-label="Close filters"
               onClick={() => setFiltersOpen(false)}
            >
               ×
            </button>
         </div>
         <fieldset>
            <legend>Bus agency</legend>
            {agencies.map((agency) => (
               <label
                  className={`filter-option ${agencyFilter === agency.id ? 'is-selected' : ''}`}
                  key={agency.id}
               >
                  <input
                     type="radio"
                     name="agency"
                     checked={agencyFilter === agency.id}
                     onChange={() => setAgencyFilter(agency.id)}
                  />
                  <span>{agency.name}</span>
                  <span className="filter-meta">{agency.rating} ★</span>
               </label>
            ))}
            <label
               className={`filter-option ${agencyFilter === 'all' ? 'is-selected' : ''}`}
            >
               <input
                  type="radio"
                  name="agency"
                  checked={agencyFilter === 'all'}
                  onChange={() => setAgencyFilter('all')}
               />
               <span>All agencies</span>
            </label>
         </fieldset>
         <fieldset>
            <legend>Bus type</legend>
            {['VIP', 'Classic', 'Standard'].map((type) => (
               <label
                  className={`filter-option ${typeFilter === type ? 'is-selected' : ''}`}
                  key={type}
               >
                  <input
                     type="radio"
                     name="type"
                     checked={typeFilter === type}
                     onChange={() => setTypeFilter(type)}
                  />
                  <span>{type}</span>
               </label>
            ))}
            <label
               className={`filter-option ${typeFilter === 'all' ? 'is-selected' : ''}`}
            >
               <input
                  type="radio"
                  name="type"
                  checked={typeFilter === 'all'}
                  onChange={() => setTypeFilter('all')}
               />
               <span>All types</span>
            </label>
         </fieldset>
         <fieldset>
            <legend>Maximum price</legend>
            <input
               className="fare-range"
               type="range"
               min="4000"
               max="12000"
               step="500"
               value={maxFare}
               onChange={(event) => setMaxFare(Number(event.target.value))}
            />
            <strong>{maxFare.toLocaleString()} FCFA</strong>
         </fieldset>
      </aside>
   );

   return (
      <main className="results-page" id="top">
         <SiteHeader
            passengerAuth={passengerAuth}
            onPassengerAuthenticated={onPassengerAuthenticated}
            onLogout={onPassengerLogout}
         />

         {requestError ? (
            <p className="results-request-error" role="alert">
               {requestError}
            </p>
         ) : null}

         <div className="results-toolbar">
            <button type="button" className="back-button" onClick={onBack}>
               ← New search
            </button>
         </div>

         <form
            className="trip-search results-trip-search"
            id="search"
            aria-label="Search trips"
            onSubmit={handleSearch}
         >
            <div className="search-heading">
               <span className="search-icon">⌁</span>
               <div>
                  <strong>Where are you going?</strong>
                  <span>Find the best trip for your journey</span>
               </div>
            </div>
            <label>
               <span>From</span>
               <input
                  list="result-locations"
                  value={filters.origin}
                  onChange={(event) =>
                     updateFilter('origin', event.target.value)
                  }
                  required
               />
            </label>
            <button
               className="swap-button"
               type="button"
               onClick={swapLocations}
               aria-label="Swap locations"
            >
               ⇄
            </button>
            <label>
               <span>To</span>
               <input
                  list="result-locations"
                  value={filters.destination}
                  onChange={(event) =>
                     updateFilter('destination', event.target.value)
                  }
                  required
               />
            </label>
            <label className="seats-field">
               <span>Seats</span>
               <input
                  type="number"
                  min="1"
                  max="10"
                  value={filters.seats}
                  onChange={(event) =>
                     updateFilter('seats', Number(event.target.value))
                  }
                  required
               />
            </label>
            <button
               className={`search-button ${isLoading ? 'is-loading' : ''}`}
               type="submit"
               disabled={isLoading}
            >
               Search trips{' '}
               <span aria-hidden="true">{isLoading ? '' : '→'}</span>
            </button>
            <datalist id="result-locations">
               {locations.map((location) => (
                  <option value={location} key={location} />
               ))}
            </datalist>
         </form>

         <div className="results-layout">
            {filterPanel}
            {filtersOpen && (
               <div
                  className="filter-backdrop"
                  onClick={() => setFiltersOpen(false)}
               />
            )}

            <section className="trips-section" id="trips">
               <p className="results-eyebrow">Available buses</p>
               <div className="trips-heading">
                  <div>
                     <h1>
                        {filters.origin} <span>→</span> {filters.destination}
                     </h1>
                     <p>
                        {filteredTrips.length} available{' '}
                        {filteredTrips.length === 1 ? 'trip' : 'trips'} for{' '}
                        {filters.seats} {filters.seats === 1 ? 'seat' : 'seats'}
                        .
                     </p>
                  </div>
                  <div className="heading-actions">
                     <button
                        type="button"
                        className="filter-toggle"
                        onClick={() => setFiltersOpen(true)}
                     >
                        ⚙ Filters
                     </button>
                     <button type="button" className="sort-button">
                        Earliest departure⌄
                     </button>
                  </div>
               </div>
               <div className="trip-list">
                  {isTripsLoading ? (
                     <div className="empty-state">
                        <strong>Loading available trips...</strong>
                     </div>
                  ) : null}
                  {!isTripsLoading &&
                     filteredTrips.map((trip) => (
                        <article className="trip-card" key={trip.id}>
                           <div className="agency-badge">
                              {trip.agency.name.slice(0, 1)}
                           </div>
                           <div className="trip-time">
                              <div className="trip-time-departure">
                                 <strong>{trip.takeoffTime}</strong>
                                 <small>{trip.date}</small>
                              </div>
                              <span>{trip.route.origin}</span>
                              <i />
                              <strong>{trip.arrivalTime}</strong>
                              <span>{trip.route.destination}</span>
                           </div>
                           <div className="trip-details">
                              <div className="trip-card-head">
                                 <strong>{trip.agency.name}</strong>
                                 <span className="trip-type-pill">
                                    {trip.bus.type}
                                 </span>
                              </div>
                              <span>{trip.bus.name}</span>
                              <small>
                                 {trip.route.estimatedDuration} ·{' '}
                                 {trip.route.distance} · {trip.availableSeats}{' '}
                                 seats left
                              </small>
                           </div>
                           <div className="trip-price">
                              <div className="fare-block">
                                 <small>From</small>
                                 <strong>
                                    {trip.totalFare.toLocaleString()} FCFA
                                 </strong>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => handleSelectTrip(trip)}
                              >
                                 Reserve seat
                              </button>
                           </div>
                        </article>
                     ))}
                  {!isTripsLoading && !filteredTrips.length && (
                     <div className="empty-state">
                        <strong>No buses match these filters.</strong>
                        <span>Adjust your filters or try another route.</span>
                        <button type="button" onClick={resetFilters}>
                           Clear filters
                        </button>
                     </div>
                  )}
               </div>
            </section>

            <aside className="right-sidebar" id="support">
               <section className="promo-card">
                  {promoSlides.map((promo, index) => (
                     <div
                        className={`promo-image ${index === activePromo ? 'is-active' : ''}`}
                        style={{ backgroundImage: `url(${promo.image})` }}
                        key={promo.title}
                     />
                  ))}
                  <div className="promo-shade" />
                  <div className="promo-content">
                     <span>{promoSlides[activePromo].tag}</span>
                     <h2>{promoSlides[activePromo].title}</h2>
                     <p>{promoSlides[activePromo].copy}</p>
                     <button type="button">Learn more →</button>
                     <div className="promo-dots">
                        {promoSlides.map((promo, index) => (
                           <button
                              type="button"
                              className={
                                 index === activePromo ? 'is-active' : ''
                              }
                              onClick={() => setActivePromo(index)}
                              aria-label={`Show promotion ${index + 1}`}
                              key={promo.title}
                           />
                        ))}
                     </div>
                  </div>
               </section>
               <section className="help-card">
                  <span>Need help?</span>
                  <h3>We are here for your journey.</h3>
                  <p>Get support with your booking, ticket, or travel plans.</p>
                  <a href="mailto:support@busby.cm">Contact support →</a>
               </section>
            </aside>
         </div>
         <Footer />
      </main>
   );
}

export default AvailableBusesPage;
