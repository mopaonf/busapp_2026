import { Fragment, useMemo, useState } from 'react';
import './BookSeatPage.css';
import SiteHeader from '../components/layout/SiteHeader';
import Footer from '../components/layout/Footer';
import PaymentModal from '../components/payment/PaymentModal';
import PassengerAuthModal from '../components/auth/PassengerAuthModal';

const defaultSeatLayout = {
   totalSeats: 30,
   seatsPerRow: 4,
   layoutSections: [2, 2],
   isDoubleDecker: false,
   lowerDeck: { seatCount: 30, startSeat: 1, frontSeatCount: 0 },
   upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
};

function BookSeatPage({
   trip,
   seatsToBook,
   passengerAuth,
   onPassengerAuthenticated,
   onPassengerLogout,
   onBack,
}) {
   const [selectedSeats, setSelectedSeats] = useState([]);
   const [bookedSeats] = useState(['3', '8', '14', '21', '25', '29']);
   const [activeDeck, setActiveDeck] = useState('lower');
   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
   const [isPassengerAuthOpen, setIsPassengerAuthOpen] = useState(false);
   const [isPaymentComplete, setIsPaymentComplete] = useState(false);
   const [paymentError, setPaymentError] = useState('');

   const seatLayout = trip?.bus?.seatLayout ?? defaultSeatLayout;

   const deckPreview = useMemo(() => {
      const resolvedLayout = seatLayout ?? defaultSeatLayout;
      const deckConfig =
         activeDeck === 'upper' && resolvedLayout.isDoubleDecker
            ? resolvedLayout.upperDeck
            : resolvedLayout.lowerDeck;
      const frontSeatCount = deckConfig.frontSeatCount ?? 0;
      const seatCount = deckConfig.seatCount ?? 0;
      const startSeat = deckConfig.startSeat ?? 1;
      const standardSeatCount = Math.max(0, seatCount - frontSeatCount);
      const standardSeatStart = startSeat + frontSeatCount;

      const frontSeatNumbers = Array.from(
         { length: frontSeatCount },
         (_, index) => startSeat + index,
      );
      const standardSeatNumbers = Array.from(
         { length: standardSeatCount },
         (_, index) => standardSeatStart + index,
      );

      const rowSize = resolvedLayout.seatsPerRow ?? 4;
      const rows = [];
      for (
         let index = 0;
         index < standardSeatNumbers.length;
         index += rowSize
      ) {
         rows.push(standardSeatNumbers.slice(index, index + rowSize));
      }

      return {
         frontSeatNumbers,
         rows,
         layoutSections: resolvedLayout.layoutSections ?? [2, 2],
      };
   }, [activeDeck, seatLayout]);

   const totalAmount = useMemo(
      () => selectedSeats.length * trip.totalFare,
      [selectedSeats.length, trip.totalFare],
   );
   const agencyRating = trip?.agency?.rating ?? 4.8;

   const toggleSeat = (seatNumber) => {
      const seatKey = String(seatNumber);
      if (bookedSeats.includes(seatKey)) return;

      setSelectedSeats((current) => {
         if (current.includes(seatKey)) {
            return current.filter((seat) => seat !== seatKey);
         }

         if (current.length >= seatsToBook) {
            return current;
         }

         return [...current, seatKey].sort(
            (left, right) => Number(left) - Number(right),
         );
      });
   };

   const renderSeatButton = (seatNumber) => {
      const seatKey = String(seatNumber);
      const isBooked = bookedSeats.includes(seatKey);
      const isSelected = selectedSeats.includes(seatKey);

      return (
         <button
            type="button"
            key={seatNumber}
            disabled={isBooked}
            className={`seat-button ${isSelected ? 'is-selected' : ''} ${isBooked ? 'is-booked' : ''}`}
            onClick={() => toggleSeat(seatNumber)}
            aria-label={`Seat ${seatNumber}${isBooked ? ', already booked' : isSelected ? ', selected' : ', available'}`}
            aria-pressed={isSelected}
         >
            {seatNumber}
         </button>
      );
   };

   const renderSeatRow = (rowSeats, rowIndex) => {
      const sections = [];
      let cursor = 0;
      deckPreview.layoutSections.forEach((sectionSize) => {
         sections.push(rowSeats.slice(cursor, cursor + sectionSize));
         cursor += sectionSize;
      });

      return (
         <div className="seat-block" key={`row-${rowIndex}`}>
            <span className="seat-row-index" aria-hidden="true">
               {rowIndex + 1}
            </span>
            <div className="seat-row">
               {sections.map((section, sectionIndex) => (
                  <Fragment key={`row-${rowIndex}-section-${sectionIndex}`}>
                     {sectionIndex > 0 ? (
                        <span className="aisle-spacer" aria-hidden="true" />
                     ) : null}
                     <div className="seat-row-section">
                        {section.map((seatNumber) =>
                           renderSeatButton(seatNumber),
                        )}
                     </div>
                  </Fragment>
               ))}
            </div>
         </div>
      );
   };

   return (
      <main className="book-seat-page" id="top">
         <SiteHeader
            passengerAuth={passengerAuth}
            onPassengerAuthenticated={onPassengerAuthenticated}
            onLogout={onPassengerLogout}
         />

         <div className="booking-toolbar">
            <h1>Select your seats</h1>
            <button type="button" className="back-button" onClick={onBack}>
               ← New search
            </button>
         </div>

         <section className="book-seat-shell" id="search">
            <div className="left-booking-column">
               <div className="panel-card details-card" id="details">
                  <div className="details-card-top">
                     <div>
                        <p className="section-kicker">Seat selection</p>
                        <h3>{trip.bus.name}</h3>
                        <p className="details-meta">
                           <span>{trip.bus.type}</span>
                           <span>•</span>
                           <span>{agencyRating.toFixed(1)} ★ rating</span>
                        </p>
                     </div>
                     <div className="booking-status-pill">
                        <strong>
                           {selectedSeats.length}/{seatsToBook}
                        </strong>
                        <span>selected</span>
                     </div>
                  </div>

                  {seatLayout.isDoubleDecker ? (
                     <div className="deck-switcher">
                        <button
                           type="button"
                           className={activeDeck === 'lower' ? 'is-active' : ''}
                           onClick={() => setActiveDeck('lower')}
                        >
                           Lower deck
                        </button>
                        <button
                           type="button"
                           className={activeDeck === 'upper' ? 'is-active' : ''}
                           onClick={() => setActiveDeck('upper')}
                        >
                           Upper deck
                        </button>
                     </div>
                  ) : null}

                  <div className="legend">
                     <span>
                        <i className="legend-dot available" />
                        Available
                     </span>
                     <span>
                        <i className="legend-dot selected" />
                        Selected
                     </span>
                     <span>
                        <i className="legend-dot booked" />
                        Booked
                     </span>
                  </div>

                  <div className="seat-layout-card">
                     <div className="deck-heading">
                        {activeDeck === 'lower' ? 'Lower deck' : 'Upper deck'}
                     </div>
                     <div className="seat-layout-stage">
                        <div className="coach-layout">
                           {activeDeck === 'lower' &&
                           seatLayout.lowerDeck?.frontSeatCount > 0 ? (
                              <div className="seat-block front-cabin-block">
                                 <span
                                    className="seat-row-index"
                                    aria-hidden="true"
                                 />
                                 <div className="front-cabin-row">
                                    <div className="driver-zone">Driver</div>
                                    <div className="front-cabin-seats">
                                       {deckPreview.frontSeatNumbers.map(
                                          (seatNumber) =>
                                             renderSeatButton(seatNumber),
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ) : null}
                           {deckPreview.rows.map((row, index) =>
                              renderSeatRow(row, index),
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <aside className="summary-panel">
               <div className="panel-card summary-card">
                  <div className="summary-route">
                     <p className="section-kicker">Trip summary</p>
                     <h3>
                        {trip.route.origin} → {trip.route.destination}
                     </h3>
                     <span>
                        {trip.route.estimatedDuration} • {trip.route.distance}
                     </span>
                  </div>

                  <div className="summary-grid">
                     <div>
                        <span>Agency</span>
                        <strong>{trip.agency.name}</strong>
                     </div>
                     <div>
                        <span>Departure</span>
                        <strong>{trip.takeoffTime}</strong>
                     </div>
                     <div>
                        <span>Arrival</span>
                        <strong>{trip.arrivalTime}</strong>
                     </div>
                     <div>
                        <span>Bus</span>
                        <strong>{trip.bus.name}</strong>
                     </div>
                  </div>

                  <div className="selected-seats-box">
                     <div className="selected-seat-top">
                        <span>Selected seats</span>
                        <strong>
                           {selectedSeats.length > 0
                              ? `${selectedSeats.length} chosen`
                              : 'No seats yet'}
                        </strong>
                     </div>
                     <div className="selected-seat-list">
                        {selectedSeats.length > 0
                           ? selectedSeats.join(', ')
                           : 'Choose preferred seats from the layout.'}
                     </div>
                  </div>

                  <div className="fare-box">
                     <div className="fare-row">
                        <span>Fare per seat</span>
                        <strong>{trip.totalFare.toLocaleString()} FCFA</strong>
                     </div>
                     <div className="fare-row total">
                        <span>Total</span>
                        <strong>{totalAmount.toLocaleString()} FCFA</strong>
                     </div>
                  </div>

                  <button
                     type="button"
                     className="continue-button"
                     disabled={selectedSeats.length === 0}
                     onClick={() => {
                        if (!passengerAuth?.token) {
                           setIsPassengerAuthOpen(true);
                           return;
                        }
                        setIsPaymentOpen(true);
                     }}
                  >
                     Continue to payment
                  </button>
                  {isPaymentComplete ? (
                     <div className="payment-success-banner" role="status">
                        <strong>Payment complete.</strong>
                        <span>Your booking is confirmed.</span>
                     </div>
                  ) : null}
                  {paymentError ? (
                     <div className="payment-error-banner" role="alert">
                        {paymentError}
                     </div>
                  ) : null}
               </div>
            </aside>
         </section>

         <Footer />

         {isPaymentOpen ? (
            <PaymentModal
               trip={trip}
               seats={selectedSeats}
               totalAmount={totalAmount}
               scheduleId={trip.id}
               passengerToken={passengerAuth?.token}
               onClose={() => setIsPaymentOpen(false)}
               onConfirm={() => {
                  setIsPaymentOpen(false);
                  setIsPaymentComplete(true);
                  setPaymentError('');
                  setSelectedSeats([]);
               }}
               onError={setPaymentError}
            />
         ) : null}
         {isPassengerAuthOpen ? (
            <PassengerAuthModal
               onClose={() => setIsPassengerAuthOpen(false)}
               onAuthenticated={(account) => {
                  onPassengerAuthenticated(account);
                  setIsPassengerAuthOpen(false);
                  setIsPaymentOpen(true);
               }}
            />
         ) : null}
      </main>
   );
}

export default BookSeatPage;
