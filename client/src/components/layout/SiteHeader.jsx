import './SiteHeader.css';
import { useState } from 'react';
import PassengerAuthModal from '../auth/PassengerAuthModal';

function SiteHeader({ passengerAuth, onPassengerAuthenticated, onLogout }) {
   const [isAuthOpen, setIsAuthOpen] = useState(false);
   const [isProfileOpen, setIsProfileOpen] = useState(false);
   const passenger = passengerAuth?.passenger;
   const initials =
      passenger?.name
         ?.split(' ')
         .map((part) => part[0])
         .join('')
         .slice(0, 2)
         .toUpperCase() || 'P';

   return (
      <>
         <header className="site-header">
            <div className="site-header-inner">
               <a className="site-brand" href="#top" aria-label="BusBy home">
                  <span className="site-brand-icon">B</span>
                  <span>BusBy</span>
               </a>

               <nav className="site-nav" aria-label="Primary navigation">
                  <a href="#search">Find a trip</a>
                  <a href="#support">Support</a>
               </nav>

               {passenger ? (
                  <div className="site-profile-wrap">
                     <button
                        type="button"
                        className="site-profile-button"
                        aria-expanded={isProfileOpen}
                        onClick={() => setIsProfileOpen((value) => !value)}
                     >
                        <span className="site-avatar">{initials}</span>
                        <span className="site-profile-name">
                           {passenger.name}
                        </span>
                        <span className="site-profile-chevron">⌄</span>
                     </button>
                     {isProfileOpen ? (
                        <div className="site-profile-menu">
                           <div className="site-profile-details">
                              <strong>{passenger.name}</strong>
                              <span>{passenger.email}</span>
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 setIsProfileOpen(false);
                                 onLogout();
                              }}
                           >
                              Sign out
                           </button>
                        </div>
                     ) : null}
                  </div>
               ) : (
                  <button
                     type="button"
                     className="site-login-button"
                     onClick={() => setIsAuthOpen(true)}
                  >
                     Sign in / Sign up
                  </button>
               )}
            </div>
         </header>
         {isAuthOpen ? (
            <PassengerAuthModal
               onClose={() => setIsAuthOpen(false)}
               onAuthenticated={(account) => {
                  onPassengerAuthenticated(account);
                  setIsAuthOpen(false);
               }}
            />
         ) : null}
      </>
   );
}

export default SiteHeader;
