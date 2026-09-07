import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AgencyLoginPage({ onLogin }) {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setError('');
      setIsSubmitting(true);

      try {
         const response = await fetch(`${API_URL}/auth/agency/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
         });
         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Unable to sign in.');
         }

         onLogin(data);
      } catch (requestError) {
         setError(requestError.message || 'Unable to sign in right now.');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <main className="grid min-h-screen place-items-center bg-[var(--color-background)] p-4 sm:p-8">
         <section className="grid w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="hidden bg-[var(--color-secondary)] p-10 text-[var(--color-text-light)] lg:flex lg:flex-col lg:justify-between">
               <div>
                  <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-lg font-bold">
                     B
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
                     BusBy Agency
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                     Keep every journey moving.
                  </h1>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                     Manage your fleet, publish routes, and stay close to every
                     booking from one operations workspace.
                  </p>
               </div>
               <p className="text-xs text-slate-400">
                  Agency operations portal
               </p>
            </div>

            <div className="p-6 sm:p-10">
               <div className="mb-8 lg:hidden">
                  <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] font-bold text-[var(--color-text-light)]">
                     B
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                     BusBy Agency
                  </p>
               </div>

               <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                     Welcome back
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                     Sign in to your agency
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                     Use the admin credentials provided by BusBy.
                  </p>
               </div>

               <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <label className="grid gap-2">
                     <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Username
                     </span>
                     <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="finexxadmin"
                        autoComplete="username"
                        className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-orange-100"
                        required
                     />
                  </label>

                  <label className="grid gap-2">
                     <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Password
                     </span>
                     <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-orange-100"
                        required
                     />
                  </label>

                  {error ? (
                     <p
                        className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                        role="alert"
                     >
                        {error}
                     </p>
                  ) : null}

                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-semibold text-[var(--color-text-light)] shadow-[var(--shadow-md)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-wait disabled:opacity-60"
                  >
                     {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
                  </button>
               </form>

               <div className="mt-8 rounded-[var(--radius-md)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text-secondary)]">
                  <p className="font-semibold text-[var(--color-text-primary)]">
                     Demo agency access
                  </p>
                  <p className="mt-1">Finexx: finexxadmin / finexxadmin123</p>
                  <p>Buca: bucaadmin / bucaadmin123</p>
                  <p>Musango: musangoadmin / musangoadmin123</p>
               </div>
            </div>
         </section>
      </main>
   );
}

export default AgencyLoginPage;
