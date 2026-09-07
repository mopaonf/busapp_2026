import { useState } from 'react';
import './PaymentModal.css';
import { createReservation } from '../../lib/clientApi';

function PaymentModal({
   trip,
   seats,
   totalAmount,
   scheduleId,
   passengerToken,
   onClose,
   onConfirm,
   onError,
}) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   return (
      <div className="payment-modal" role="presentation" onClick={onClose}>
         <div
            className="payment-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
            aria-describedby="payment-description"
            onClick={(event) => event.stopPropagation()}
         >
            <button
               type="button"
               className="payment-close"
               aria-label="Close payment modal"
               onClick={onClose}
            >
               ×
            </button>

            <div className="payment-header">
               <p className="payment-eyebrow">Secure checkout</p>
               <h2 id="payment-title">Complete your booking</h2>
               <p id="payment-description">
                  Review your trip, choose a payment method, and confirm your
                  seat reservation.
               </p>
            </div>

            <div className="payment-layout">
               <section className="payment-form-panel">
                  <div className="payment-methods" aria-label="Payment methods">
                     <button type="button" className="is-active">
                        Card
                     </button>
                     <button type="button">Mobile money</button>
                     <button type="button">Wallet</button>
                  </div>

                  <form
                     className="payment-form"
                     onSubmit={async (event) => {
                        event.preventDefault();
                        setIsSubmitting(true);
                        try {
                           const result = await createReservation(
                              passengerToken,
                              {
                                 scheduleId,
                                 seats,
                              },
                           );
                           onConfirm(result);
                        } catch (error) {
                           onError(error.message);
                        } finally {
                           setIsSubmitting(false);
                        }
                     }}
                  >
                     <label>
                        <span>Cardholder name</span>
                        <input
                           type="text"
                           placeholder="Enter name on card"
                           autoComplete="cc-name"
                           required
                        />
                     </label>
                     <label>
                        <span>Card number</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           placeholder="1234 5678 9012 3456"
                           autoComplete="cc-number"
                           required
                        />
                     </label>
                     <div className="payment-grid">
                        <label>
                           <span>Expiry</span>
                           <input
                              type="text"
                              inputMode="numeric"
                              placeholder="MM/YY"
                              autoComplete="cc-exp"
                              required
                           />
                        </label>
                        <label>
                           <span>CVV</span>
                           <input
                              type="password"
                              inputMode="numeric"
                              placeholder="123"
                              autoComplete="cc-csc"
                              required
                           />
                        </label>
                     </div>
                     <label>
                        <span>Phone number</span>
                        <input
                           type="tel"
                           placeholder="(237) 6xx xxx xxx"
                           autoComplete="tel"
                           required
                        />
                     </label>

                     <button
                        type="submit"
                        className="payment-submit"
                        disabled={isSubmitting}
                     >
                        {isSubmitting
                           ? 'Processing reservation...'
                           : `Pay ${totalAmount.toLocaleString()} FCFA`}
                     </button>
                  </form>
               </section>

               <aside className="payment-summary-panel">
                  <div className="payment-summary-card">
                     <span className="payment-summary-kicker">
                        Trip summary
                     </span>
                     <h3>
                        {trip.route.origin} → {trip.route.destination}
                     </h3>
                     <p>{trip.agency.name}</p>

                     <dl>
                        <div>
                           <dt>Bus</dt>
                           <dd>{trip.bus.name}</dd>
                        </div>
                        <div>
                           <dt>Departure</dt>
                           <dd>{trip.takeoffTime}</dd>
                        </div>
                        <div>
                           <dt>Seats</dt>
                           <dd>{seats.join(', ') || 'No seats selected'}</dd>
                        </div>
                        <div>
                           <dt>Total</dt>
                           <dd>{totalAmount.toLocaleString()} FCFA</dd>
                        </div>
                     </dl>
                  </div>

                  <div className="payment-note">
                     <strong>Payment protected</strong>
                     <p>
                        This is a demo checkout flow. It is styled to match the
                        booking experience and ready for a real gateway later.
                     </p>
                  </div>
               </aside>
            </div>
         </div>
      </div>
   );
}

export default PaymentModal;
