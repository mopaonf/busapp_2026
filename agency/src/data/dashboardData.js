import {
   FaBus,
   FaCalendarDays,
   FaChartLine,
   FaClipboardList,
   FaGear,
   FaRightFromBracket,
   FaRoute,
   FaTicket,
   FaCircleUser,
} from 'react-icons/fa6';

export const sidebarItems = [
   { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
   { id: 'buses', label: 'Bus Management', icon: FaBus },
   { id: 'routes', label: 'Route Management', icon: FaRoute },
   { id: 'schedules', label: 'Schedule Management', icon: FaCalendarDays },
   { id: 'bookings', label: 'Booking Management', icon: FaTicket },
   { id: 'reports', label: 'Reports', icon: FaClipboardList },
   { id: 'profile', label: 'Agency Profile', icon: FaCircleUser },
   { id: 'settings', label: 'Settings', icon: FaGear },
   { id: 'logout', label: 'Logout', icon: FaRightFromBracket },
];

export const summaryCards = [
   { label: 'Total Buses', value: '28', note: '3 pending maintenance checks' },
   {
      label: 'Active Routes',
      value: '14',
      note: 'Across 6 destination corridors',
   },
   {
      label: 'Upcoming Trips',
      value: '42',
      note: 'Trips scheduled for the next 72 hours',
   },
   {
      label: "Today's Bookings",
      value: '186',
      note: '11% higher than yesterday',
   },
   {
      label: 'Total Reservations',
      value: '1,284',
      note: 'Confirmed, held, and pending',
   },
   {
      label: 'Revenue',
      value: 'Pending',
      note: 'Placeholder until finance module is ready',
   },
];

export const recentBookings = [
   {
      passenger: 'Nana M.',
      route: 'Buea - Douala',
      bus: 'Finexs Express',
      status: 'Confirmed',
      amount: 'FCFA 12,000',
   },
   {
      passenger: 'Elvis T.',
      route: 'Bamenda - Yaounde',
      bus: 'Finexs 02',
      status: 'Pending',
      amount: 'FCFA 15,000',
   },
   {
      passenger: 'Sandra N.',
      route: 'Kumba - Yaounde',
      bus: 'Finexs 03',
      status: 'Confirmed',
      amount: 'FCFA 18,000',
   },
];

export const upcomingDepartures = [
   {
      time: '06:30',
      route: 'Bamenda - Douala',
      bus: 'Finexs Express',
      seats: '22 seats left',
   },
   {
      time: '09:15',
      route: 'Kumba - Yaounde',
      bus: 'Finexs 02',
      seats: '8 seats left',
   },
   {
      time: '14:00',
      route: 'Buea - Yaounde',
      bus: 'Finexs 03',
      seats: 'Limited availability',
   },
];

export const busStatus = [
   { label: 'Available', value: '18 buses' },
   { label: 'In Maintenance', value: '4 buses' },
   { label: 'Inactive', value: '6 buses' },
];

export const buses = [
   {
      name: 'Finexs 01',
      plate: 'CE-421-19',
      status: 'Active',
      type: 'VIP',
      capacity: '45 seats',
   },
   {
      name: 'Finexs 02',
      plate: 'CE-422-19',
      status: 'Maintenance',
      type: 'Classic',
      capacity: '52 seats',
   },
   {
      name: 'Finexs 03',
      plate: 'CE-423-19',
      status: 'Active',
      type: 'Standard',
      capacity: '40 seats',
   },
];

export const busTypeProfiles = {
   VIP: {
      label: 'VIP',
      capacity: '45 seats',
      layout: '2 + 1 luxury cabin',
      seatsPerRow: 3,
      priceIncrease: 5000,
      description: 'Executive luxury seating for premium routes.',
   },
   Classic: {
      label: 'Classic',
      capacity: '52 seats',
      layout: '2 + 2 standard cabin',
      seatsPerRow: 4,
      priceIncrease: 2000,
      description: 'Comfort seating tier for regular trips.',
   },
   Standard: {
      label: 'Standard',
      capacity: '40 seats',
      layout: '2 + 2 standard cabin',
      seatsPerRow: 4,
      priceIncrease: 0,
      description: 'Standard base fare seating for general routes.',
   },
};

export const amenityOptions = [
   { id: 'wifi', label: 'Wi-Fi available' },
   { id: 'ac', label: 'Air conditioning' },
   { id: 'toilet', label: 'On-board toilet' },
   { id: 'charging', label: 'Charging ports' },
   { id: 'tv', label: 'Entertainment screen' },
   { id: 'luggage', label: 'Luggage rack' },
];

export const routes = [
   {
      id: 'RT-001',
      name: 'Douala to Yaounde',
      origin: 'Douala',
      originRegion: 'Littoral',
      destination: 'Yaounde',
      destinationRegion: 'Centre',
      baseFare: 4500,
      distance: '245 km',
      estimatedDuration: '3.5 hrs',
      status: 'Active',
      schedulesCount: 8,
   },
   {
      id: 'RT-002',
      name: 'Bamenda to Douala',
      origin: 'Bamenda',
      originRegion: 'North West',
      destination: 'Douala',
      destinationRegion: 'Littoral',
      baseFare: 6000,
      distance: '310 km',
      estimatedDuration: '5.0 hrs',
      status: 'Active',
      schedulesCount: 5,
   },
   {
      id: 'RT-003',
      name: 'Buea to Yaounde',
      origin: 'Buea',
      originRegion: 'South West',
      destination: 'Yaounde',
      destinationRegion: 'Centre',
      baseFare: 5000,
      distance: '290 km',
      estimatedDuration: '4.5 hrs',
      status: 'Active',
      schedulesCount: 4,
   },
   {
      id: 'RT-004',
      name: 'Kumba to Douala',
      origin: 'Kumba',
      originRegion: 'South West',
      destination: 'Douala',
      destinationRegion: 'Littoral',
      baseFare: 3500,
      distance: '120 km',
      estimatedDuration: '2.5 hrs',
      status: 'Inactive',
      schedulesCount: 0,
   },
];

export const schedules = [
   {
      id: 'SCH-101',
      date: '2026-07-30',
      takeoffTime: '06:30',
      arrivalTime: '10:00',
      routeId: 'RT-001',
      routeName: 'Douala to Yaounde',
      origin: 'Douala',
      destination: 'Yaounde',
      busName: 'Finexs 01',
      busType: 'VIP',
      capacity: 45,
      availableSeats: 22,
      baseFare: 4500,
      tierMarkup: 5000,
      totalFare: 9500,
      status: 'Published',
   },
   {
      id: 'SCH-102',
      date: '2026-07-30',
      takeoffTime: '09:15',
      arrivalTime: '13:45',
      routeId: 'RT-003',
      routeName: 'Buea to Yaounde',
      origin: 'Buea',
      destination: 'Yaounde',
      busName: 'Finexs 03',
      busType: 'Standard',
      capacity: 40,
      availableSeats: 15,
      baseFare: 5000,
      tierMarkup: 0,
      totalFare: 5000,
      status: 'Draft',
   },
   {
      id: 'SCH-103',
      date: '2026-07-30',
      takeoffTime: '14:00',
      arrivalTime: '19:00',
      routeId: 'RT-002',
      routeName: 'Bamenda to Douala',
      origin: 'Bamenda',
      destination: 'Douala',
      busName: 'Finexs 02',
      busType: 'Classic',
      capacity: 52,
      availableSeats: 38,
      baseFare: 6000,
      tierMarkup: 2000,
      totalFare: 8000,
      status: 'Published',
   },
];

export const bookings = [
   {
      id: 'BK-2041',
      passenger: 'Nana M.',
      route: 'Buea - Douala',
      status: 'Confirmed',
      date: 'Today',
   },
   {
      id: 'BK-2042',
      passenger: 'Elvis T.',
      route: 'Bamenda - Yaounde',
      status: 'Pending',
      date: 'Today',
   },
   {
      id: 'BK-2043',
      passenger: 'Sandra N.',
      route: 'Kumba - Yaounde',
      status: 'Cancelled',
      date: 'Yesterday',
   },
];

export const appMeta = {
   agencyName: 'BusBy Agency',
   agencyTagline: 'Transport operations control center',
};
