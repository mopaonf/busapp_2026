import { useEffect, useState } from 'react';
import './App.css';
import SiteHeader from './components/layout/SiteHeader';
import { getLocations } from './lib/clientApi';
import AvailableBusesPage from './pages/AvailableBusesPage';
import BookSeatPage from './pages/BookSeatPage';
import Footer from './components/layout/Footer';

const slides = [
   {
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2200&q=85',
      eyebrow: 'Travel with confidence',
      title: 'Your next journey starts here.',
      copy: 'Search trusted bus agencies, choose your perfect seat, and reserve in a few simple steps.',
   },
   {
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85',
      eyebrow: 'Go further, together',
      title: 'More routes. More freedom.',
      copy: 'Find convenient departures for the places and people that matter most.',
   },
   {
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2200&q=85',
      eyebrow: 'Comfort on every mile',
      title: 'Sit back and enjoy the ride.',
      copy: 'Compare schedules and prices, then choose the journey that works for you.',
   },
   {
      image: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=2200&q=85',
      eyebrow: 'Simple reservations',
      title: 'Book seats without the queue.',
      copy: 'Plan ahead from anywhere and keep your trip details close at hand.',
   },
   {
      image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85',
      eyebrow: 'Every road has a story',
      title: 'Make your next trip memorable.',
      copy: 'From quick getaways to long-distance travel, BusBy gets you moving.',
   },
];

function App() {
   const [activeSlide, setActiveSlide] = useState(0);
   const [origin, setOrigin] = useState('');
   const [destination, setDestination] = useState('');
   const [seats, setSeats] = useState(1);
   const [isLoading, setIsLoading] = useState(false);
   const [search, setSearch] = useState(null);
   const [selectedTrip, setSelectedTrip] = useState(null);
   const [locations, setLocations] = useState([]);
   const [passengerAuth, setPassengerAuth] = useState(() => {
      try {
         return JSON.parse(localStorage.getItem('busby-passenger')) || null;
      } catch {
         return null;
      }
   });

   useEffect(() => {
      getLocations()
         .then(setLocations)
         .catch(() => setLocations([]));
   }, []);

   const handlePassengerAuthenticated = (account) => {
      localStorage.setItem('busby-passenger', JSON.stringify(account));
      setPassengerAuth(account);
   };

   const handlePassengerLogout = () => {
      localStorage.removeItem('busby-passenger');
      setPassengerAuth(null);
   };

   useEffect(() => {
      const timer = window.setInterval(() => {
         setActiveSlide((current) => (current + 1) % slides.length);
      }, 6000);
      return () => window.clearInterval(timer);
   }, []);

   const moveSlide = (direction) => {
      setActiveSlide(
         (current) => (current + direction + slides.length) % slides.length,
      );
   };

   const swapLocations = () => {
      setOrigin(destination);
      setDestination(origin);
   };

   const handleSearch = (event) => {
      event.preventDefault();
      setIsLoading(true);
      window.setTimeout(() => {
         setSearch({ origin, destination, seats: Number(seats) });
         setIsLoading(false);
      }, 2000);
   };

   if (selectedTrip) {
      return (
         <BookSeatPage
            trip={selectedTrip}
            seatsToBook={search?.seats ?? 1}
            passengerAuth={passengerAuth}
            onPassengerAuthenticated={handlePassengerAuthenticated}
            onPassengerLogout={handlePassengerLogout}
            onBack={() => setSelectedTrip(null)}
         />
      );
   }

   if (search) {
      return (
         <AvailableBusesPage
            search={search}
            onSearch={setSearch}
            onBack={() => setSearch(null)}
            onSelectTrip={setSelectedTrip}
            passengerAuth={passengerAuth}
            onPassengerAuthenticated={handlePassengerAuthenticated}
            onPassengerLogout={handlePassengerLogout}
         />
      );
   }

   return (
      <main className="home-page" id="top">
         <SiteHeader
            passengerAuth={passengerAuth}
            onPassengerAuthenticated={handlePassengerAuthenticated}
            onLogout={handlePassengerLogout}
         />

         <section className="hero" aria-label="Bus ticket reservation">
            {slides.map((slide, index) => (
               <div
                  className={`hero-slide ${index === activeSlide ? 'is-active' : ''}`}
                  key={slide.title}
                  aria-hidden={index !== activeSlide}
                  style={{ backgroundImage: `url(${slide.image})` }}
               />
            ))}
            <div className="hero-overlay" />

            <div className="hero-content">
               <div className="hero-copy">
                  <p className="eyebrow">{slides[activeSlide].eyebrow}</p>
                  <h1>{slides[activeSlide].title}</h1>
                  <p className="hero-description">{slides[activeSlide].copy}</p>
               </div>
            </div>

            <div className="slider-controls" aria-label="Hero slides">
               <button
                  type="button"
                  onClick={() => moveSlide(-1)}
                  aria-label="Previous slide"
               >
                  ‹
               </button>
               <div className="slide-dots">
                  {slides.map((slide, index) => (
                     <button
                        type="button"
                        className={index === activeSlide ? 'active' : ''}
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Show slide ${index + 1}`}
                        aria-pressed={index === activeSlide}
                        key={slide.title}
                     />
                  ))}
               </div>
               <button
                  type="button"
                  onClick={() => moveSlide(1)}
                  aria-label="Next slide"
               >
                  ›
               </button>
            </div>

            <form className="trip-search" id="search" onSubmit={handleSearch}>
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
                     type="text"
                     name="origin"
                     list="locations"
                     value={origin}
                     onChange={(event) => setOrigin(event.target.value)}
                     placeholder="Takeoff location"
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
                     type="text"
                     name="destination"
                     list="locations"
                     value={destination}
                     onChange={(event) => setDestination(event.target.value)}
                     placeholder="Destination"
                     required
                  />
               </label>
               <label className="seats-field">
                  <span>Seats</span>
                  <input
                     type="number"
                     name="seats"
                     min="1"
                     max="10"
                     value={seats}
                     onChange={(event) => setSeats(event.target.value)}
                     aria-label="Number of seats"
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
               <datalist id="locations">
                  {locations.map((location) => (
                     <option value={location} key={location} />
                  ))}
               </datalist>
            </form>
         </section>

         <section className="benefits" id="how-it-works">
            <article>
               <span>01</span>
               <h2>Search a route</h2>
               <p>
                  Choose your departure point, destination, and number of seats.
               </p>
            </article>
            <article>
               <span>02</span>
               <h2>Pick your trip</h2>
               <p>Compare schedules, agencies, amenities, and ticket prices.</p>
            </article>
            <article>
               <span>03</span>
               <h2>Reserve your seat</h2>
               <p>Secure your place and receive your booking confirmation.</p>
            </article>
         </section>
         <Footer />
      </main>
   );
}

export default App;
