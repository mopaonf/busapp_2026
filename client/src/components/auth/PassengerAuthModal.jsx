import { useState } from 'react';
import { passengerLogin, passengerRegister } from '../../lib/clientApi';
import './PassengerAuthModal.css';

function PassengerAuthModal({ onAuthenticated, onClose }) {
   const [mode, setMode] = useState('login');
   const [form, setForm] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
   });
   const [error, setError] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   const update = (field, value) =>
      setForm((current) => ({ ...current, [field]: value }));

   const handleSubmit = async (event) => {
      event.preventDefault();
      setError('');
      setIsSubmitting(true);
      try {
         const data =
            mode === 'login'
               ? await passengerLogin({
                    email: form.email,
                    password: form.password,
                 })
               : await passengerRegister(form);
         onAuthenticated(data);
      } catch (requestError) {
         setError(requestError.message);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div
         className="passenger-auth-modal"
         role="presentation"
         onClick={onClose}
      >
         <section
            className="passenger-auth-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="passenger-auth-title"
            onClick={(event) => event.stopPropagation()}
         >
            <button
               type="button"
               className="passenger-auth-close"
               onClick={onClose}
               aria-label="Close authentication"
            >
               ×
            </button>
            <p className="passenger-auth-kicker">BusBy passenger account</p>
            <h2 id="passenger-auth-title">
               {mode === 'login'
                  ? 'Sign in to continue'
                  : 'Create your account'}
            </h2>
            <p className="passenger-auth-copy">
               An account is required before you can proceed to payment.
            </p>

            <div className="passenger-auth-tabs" role="tablist">
               <button
                  type="button"
                  className={mode === 'login' ? 'is-active' : ''}
                  onClick={() => {
                     setMode('login');
                     setError('');
                  }}
               >
                  Sign in
               </button>
               <button
                  type="button"
                  className={mode === 'register' ? 'is-active' : ''}
                  onClick={() => {
                     setMode('register');
                     setError('');
                  }}
               >
                  Create account
               </button>
            </div>

            <form className="passenger-auth-form" onSubmit={handleSubmit}>
               {mode === 'register' ? (
                  <>
                     <label>
                        <span>Full name</span>
                        <input
                           value={form.name}
                           onChange={(event) =>
                              update('name', event.target.value)
                           }
                           autoComplete="name"
                           required
                        />
                     </label>
                     <label>
                        <span>Phone number</span>
                        <input
                           type="tel"
                           value={form.phone}
                           onChange={(event) =>
                              update('phone', event.target.value)
                           }
                           autoComplete="tel"
                        />
                     </label>
                  </>
               ) : null}
               <label>
                  <span>Email address</span>
                  <input
                     type="email"
                     value={form.email}
                     onChange={(event) => update('email', event.target.value)}
                     autoComplete="email"
                     required
                  />
               </label>
               <label>
                  <span>Password</span>
                  <input
                     type="password"
                     value={form.password}
                     onChange={(event) =>
                        update('password', event.target.value)
                     }
                     autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                     }
                     minLength={8}
                     required
                  />
               </label>
               {error ? (
                  <p className="passenger-auth-error" role="alert">
                     {error}
                  </p>
               ) : null}
               <button
                  type="submit"
                  className="passenger-auth-submit"
                  disabled={isSubmitting}
               >
                  {isSubmitting
                     ? 'Please wait...'
                     : mode === 'login'
                       ? 'Sign in and continue'
                       : 'Create account and continue'}
               </button>
            </form>
         </section>
      </div>
   );
}

export default PassengerAuthModal;
