import './Footer.css';

function Footer() {
   return (
      <footer className="site-footer" id="support">
         <div className="footer-glow" />
         <div className="footer-content">
            <div className="footer-grid">
               <div className="footer-brand-column">
                  <a className="footer-brand" href="#top">
                     <span>B</span>BusBy
                  </a>
                  <p>
                     Making bus travel across Cameroon simple, reliable, and
                     comfortable for everyone.
                  </p>
                  <div className="social-links" aria-label="Social links">
                     <a href="#facebook" aria-label="Facebook">
                        f
                     </a>
                     <a href="#instagram" aria-label="Instagram">
                        ◎
                     </a>
                     <a href="#x" aria-label="X">
                        𝕏
                     </a>
                  </div>
               </div>
               <div>
                  <h3>Explore</h3>
                  <a href="#search">Find a trip</a>
                  <a href="#how-it-works">How it works</a>
                  <a href="#agencies">Bus agencies</a>
                  <a href="#offers">Travel offers</a>
               </div>
               <div>
                  <h3>Support</h3>
                  <a href="#help">Help centre</a>
                  <a href="#contact">Contact us</a>
                  <a href="#terms">Terms of service</a>
                  <a href="#privacy">Privacy policy</a>
               </div>
               <div className="newsletter">
                  <h3>Travel updates</h3>
                  <p>Get fare alerts and travel news in your inbox.</p>
                  <form onSubmit={(event) => event.preventDefault()}>
                     <input
                        type="email"
                        aria-label="Email address"
                        placeholder="Your email address"
                        required
                     />
                     <button type="submit" aria-label="Subscribe">
                        →
                     </button>
                  </form>
               </div>
            </div>
            <div className="footer-bottom">
               <span>
                  © {new Date().getFullYear()} BusBy. All rights reserved.
               </span>
               <span>Secure bus bookings</span>
            </div>
         </div>
      </footer>
   );
}

export default Footer;
