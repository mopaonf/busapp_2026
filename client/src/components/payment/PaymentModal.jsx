import { useState } from 'react';
import './PaymentModal.css';
import { createReservation, getReservationStatus } from '../../lib/clientApi';

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
   const [operator, setOperator] = useState('MTN');
   const gatewayAmount = Math.max(
      2,
      Math.min(3, Math.ceil(totalAmount / 10000)),
   );

   const submitPayment = async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
         const phone = new FormData(event.currentTarget).get('phone');
         let result = await createReservation(passengerToken, {
            scheduleId,
            seats,
            phone,
            operator,
         });
         for (
            let attempt = 0;
            attempt < 6 && result?.reservation?.paymentStatus === 'Pending';
            attempt += 1
         ) {
            await new Promise((resolve) => window.setTimeout(resolve, 3000));
            const reservationId =
               result.reservationId ||
               result.reservation?._id ||
               result.reservation?.id;
            if (!reservationId)
               throw new Error(
                  'Reservation was created but no reference was returned.',
               );
            result = await getReservationStatus(passengerToken, reservationId);
         }
         onConfirm(result);
      } catch (error) {
         onError(error.message);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="payment-modal" role="presentation" onClick={onClose}>
         <div
            className="payment-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
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
               <p>
                  Review your trip, choose a payment method, and confirm your
                  seat reservation.
               </p>
            </div>
            <div className="payment-layout">
               <section className="payment-form-panel">
                  <div className="payment-methods" aria-label="Payment methods">
                     <button
                        type="button"
                        className={operator === 'MTN' ? 'is-active' : ''}
                        onClick={() => setOperator('MTN')}
                     >
                        MTN Mobile Money
                     </button>
                     <button
                        type="button"
                        className={operator === 'ORANGE' ? 'is-active' : ''}
                        onClick={() => setOperator('ORANGE')}
                     >
                        Orange Money
                     </button>
                  </div>
                  <form className="payment-form" onSubmit={submitPayment}>
                     <label>
                        <span>Mobile money phone number</span>
                        <input
                           type="tel"
                           name="phone"
                           inputMode="numeric"
                           placeholder="677018361"
                           autoComplete="tel"
                           pattern="[0-9 ]{9,13}"
                           required
                        />
                     </label>
                     <button
                        type="submit"
                        className="payment-submit"
                        disabled={isSubmitting}
                     >
                        {isSubmitting
                           ? 'Processing payment...'
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
                           <dd>{seats.join(', ')}</dd>
                        </div>
                        <div>
                           <dt>Ticket total</dt>
                           <dd>{totalAmount.toLocaleString()} FCFA</dd>
                        </div>
                     </dl>
                  </div>
                  <div className="payment-note">
                     <strong>Campay test mode</strong>
                     <p>
                        Campay will receive a transparent test charge of{' '}
                        {gatewayAmount} FCFA. The booking record keeps the full
                        ticket total of {totalAmount.toLocaleString()} FCFA.
                     </p>
                  </div>
               </aside>
            </div>
         </div>
      </div>
   );
}

export default PaymentModal;
