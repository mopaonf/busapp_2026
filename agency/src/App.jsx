import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/dashboard/Sidebar';
import Topbar from './components/dashboard/Topbar';
import { appMeta, sidebarItems } from './data/dashboardData';
import DashboardHome from './pages/DashboardHome';
import BusManagementPage from './pages/BusManagementPage';
import RouteManagementPage from './pages/RouteManagementPage';
import ScheduleManagementPage from './pages/ScheduleManagementPage';
import BookingManagementPage from './pages/BookingManagementPage';
import AgencyLoginPage from './pages/AgencyLoginPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'busby-agency-auth';

const pageMap = {
   dashboard: DashboardHome,
   buses: BusManagementPage,
   routes: RouteManagementPage,
   schedules: ScheduleManagementPage,
   bookings: BookingManagementPage,
};

const pageProps = {
   buses: (token) => ({ token }),
   routes: (token) => ({ token }),
   schedules: (token) => ({ token }),
   bookings: (token) => ({ token }),
};

function App() {
   const [auth, setAuth] = useState(() => {
      try {
         return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
      } catch {
         return null;
      }
   });
   const [isCheckingSession, setIsCheckingSession] = useState(Boolean(auth));
   const [activePage, setActivePage] = useState('dashboard');
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

   useEffect(() => {
      if (!auth?.token) return undefined;

      fetch(`${API_URL}/auth/agency/me`, {
         headers: { Authorization: `Bearer ${auth.token}` },
      })
         .then((response) => {
            if (!response.ok) throw new Error('Session expired');
            return response.json();
         })
         .then((data) =>
            setAuth((current) => ({ ...current, admin: data.admin })),
         )
         .catch(() => {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setAuth(null);
         })
         .finally(() => setIsCheckingSession(false));
   }, [auth?.token]);

   const handleLogin = (data) => {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      setAuth(data);
   };

   const handleLogout = () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(null);
      setActivePage('dashboard');
   };

   const ActivePage = useMemo(
      () => pageMap[activePage] ?? DashboardHome,
      [activePage],
   );

   const handleNavigate = (pageId) => {
      if (pageId === 'logout') {
         handleLogout();
         return;
      }

      if (
         pageId === 'reports' ||
         pageId === 'profile' ||
         pageId === 'settings'
      ) {
         setActivePage('dashboard');
      } else {
         setActivePage(pageId);
      }

      setMobileSidebarOpen(false);
   };

   if (isCheckingSession) {
      return (
         <main className="grid min-h-screen place-items-center bg-[var(--color-background)] text-sm text-[var(--color-text-secondary)]">
            Checking your agency session...
         </main>
      );
   }

   if (!auth?.token) {
      return <AgencyLoginPage onLogin={handleLogin} />;
   }

   return (
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
         <div className="flex min-h-screen">
            <Sidebar
               items={sidebarItems}
               activePage={activePage}
               onNavigate={handleNavigate}
               collapsed={sidebarCollapsed}
               onToggle={() => setSidebarCollapsed((value) => !value)}
               mobileOpen={mobileSidebarOpen}
               onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
               <Topbar
                  agencyName={appMeta.agencyName}
                  admin={auth.admin}
                  onMenuClick={() => setMobileSidebarOpen(true)}
               />

               <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                  <div className="mx-auto w-full max-w-[1450px]">
                     <ActivePage
                        {...(pageProps[activePage]?.(auth.token) || {})}
                     />
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}

export default App;
