// Temporary client data. The API will later return this same agency-owned shape.
export const agencies = [
   { id: 'AG-FINEXS', name: 'Finexs Voyages', rating: 4.8 },
   { id: 'AG-BUCAVOYAGES', name: 'Buca Voyages', rating: 4.6 },
   { id: 'AG-MUSANGO', name: 'Musango Bus Service', rating: 4.5 },
];

export const buses = [
   {
      id: 'BUS-FX-01',
      agencyId: 'AG-FINEXS',
      name: 'Finexs 01',
      type: 'VIP',
      capacity: 50,
      seatLayout: {
         totalSeats: 50,
         seatsPerRow: 4,
         layoutSections: [2, 2],
         isDoubleDecker: true,
         lowerDeck: { seatCount: 26, startSeat: 1, frontSeatCount: 2 },
         upperDeck: { seatCount: 24, startSeat: 27, frontSeatCount: 0 },
      },
   },
   {
      id: 'BUS-FX-02',
      agencyId: 'AG-FINEXS',
      name: 'Finexs 02',
      type: 'Classic',
      capacity: 50,
      seatLayout: {
         totalSeats: 50,
         seatsPerRow: 4,
         layoutSections: [2, 2],
         isDoubleDecker: false,
         lowerDeck: { seatCount: 50, startSeat: 1, frontSeatCount: 2 },
         upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
      },
   },
   {
      id: 'BUS-FX-03',
      agencyId: 'AG-FINEXS',
      name: 'Finexs 03',
      type: 'Standard',
      capacity: 40,
      seatLayout: {
         totalSeats: 40,
         seatsPerRow: 4,
         layoutSections: [2, 2],
         isDoubleDecker: false,
         lowerDeck: { seatCount: 40, startSeat: 1, frontSeatCount: 1 },
         upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
      },
   },
   {
      id: 'BUS-BV-01',
      agencyId: 'AG-BUCAVOYAGES',
      name: 'Buca Executive',
      type: 'VIP',
      capacity: 45,
      seatLayout: {
         totalSeats: 45,
         seatsPerRow: 4,
         layoutSections: [2, 2],
         isDoubleDecker: false,
         lowerDeck: { seatCount: 45, startSeat: 1, frontSeatCount: 2 },
         upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
      },
   },
   {
      id: 'BUS-MS-01',
      agencyId: 'AG-MUSANGO',
      name: 'Musango Express',
      type: 'Classic',
      capacity: 52,
      seatLayout: {
         totalSeats: 52,
         seatsPerRow: 4,
         layoutSections: [2, 2],
         isDoubleDecker: false,
         lowerDeck: { seatCount: 52, startSeat: 1, frontSeatCount: 2 },
         upperDeck: { seatCount: 0, startSeat: 1, frontSeatCount: 0 },
      },
   },
];

export const routes = [
   {
      id: 'RT-001',
      agencyId: 'AG-FINEXS',
      origin: 'Douala',
      destination: 'Yaounde',
      distance: '245 km',
      estimatedDuration: '3h 30m',
      baseFare: 4500,
      status: 'Active',
   },
   {
      id: 'RT-002',
      agencyId: 'AG-FINEXS',
      origin: 'Bamenda',
      destination: 'Douala',
      distance: '310 km',
      estimatedDuration: '5h',
      baseFare: 6000,
      status: 'Active',
   },
   {
      id: 'RT-003',
      agencyId: 'AG-FINEXS',
      origin: 'Buea',
      destination: 'Yaounde',
      distance: '290 km',
      estimatedDuration: '4h 30m',
      baseFare: 5000,
      status: 'Active',
   },
   {
      id: 'RT-004',
      agencyId: 'AG-BUCAVOYAGES',
      origin: 'Douala',
      destination: 'Yaounde',
      distance: '245 km',
      estimatedDuration: '3h 45m',
      baseFare: 5000,
      status: 'Active',
   },
   {
      id: 'RT-005',
      agencyId: 'AG-MUSANGO',
      origin: 'Buea',
      destination: 'Yaounde',
      distance: '290 km',
      estimatedDuration: '4h 15m',
      baseFare: 5500,
      status: 'Active',
   },
];

export const schedules = [
   {
      id: 'SCH-101',
      agencyId: 'AG-FINEXS',
      routeId: 'RT-001',
      busId: 'BUS-FX-01',
      takeoffTime: '06:30',
      arrivalTime: '10:00',
      availableSeats: 22,
      totalFare: 9500,
      status: 'Published',
   },
   {
      id: 'SCH-102',
      agencyId: 'AG-FINEXS',
      routeId: 'RT-001',
      busId: 'BUS-FX-03',
      takeoffTime: '13:00',
      arrivalTime: '16:30',
      availableSeats: 15,
      totalFare: 4500,
      status: 'Published',
   },
   {
      id: 'SCH-103',
      agencyId: 'AG-FINEXS',
      routeId: 'RT-002',
      busId: 'BUS-FX-02',
      takeoffTime: '14:00',
      arrivalTime: '19:00',
      availableSeats: 38,
      totalFare: 8000,
      status: 'Published',
   },
   {
      id: 'SCH-104',
      agencyId: 'AG-BUCAVOYAGES',
      routeId: 'RT-004',
      busId: 'BUS-BV-01',
      takeoffTime: '08:00',
      arrivalTime: '11:45',
      availableSeats: 12,
      totalFare: 10000,
      status: 'Published',
   },
   {
      id: 'SCH-105',
      agencyId: 'AG-MUSANGO',
      routeId: 'RT-005',
      busId: 'BUS-MS-01',
      takeoffTime: '09:15',
      arrivalTime: '13:30',
      availableSeats: 27,
      totalFare: 7500,
      status: 'Published',
   },
];

export const locations = [
   ...new Set(
      routes.flatMap(({ origin, destination }) => [origin, destination]),
   ),
];

const getFutureDate = (daysFromToday) => {
   const date = new Date();
   date.setHours(12, 0, 0, 0);
   date.setDate(date.getDate() + daysFromToday);
   return date.toISOString().slice(0, 10);
};

const isScheduleUpcoming = (schedule, now = new Date()) => {
   if (!schedule.date || !schedule.takeoffTime) return false;
   const departure = new Date(`${schedule.date}T${schedule.takeoffTime}:00`);
   return !Number.isNaN(departure.getTime()) && departure >= now;
};

const scheduleDates = [
   getFutureDate(1),
   getFutureDate(2),
   getFutureDate(3),
   getFutureDate(4),
   getFutureDate(5),
];

schedules.forEach((schedule, index) => {
   schedule.date = scheduleDates[index];
});

export const getAvailableTrips = (origin, destination, seats) =>
   schedules
      .filter(
         (schedule) =>
            schedule.status === 'Published' &&
            schedule.availableSeats >= seats &&
            isScheduleUpcoming(schedule),
      )
      .map((schedule) => ({
         ...schedule,
         route: routes.find((route) => route.id === schedule.routeId),
         bus: buses.find((bus) => bus.id === schedule.busId),
         agency: agencies.find((agency) => agency.id === schedule.agencyId),
      }))
      .filter(
         ({ route }) =>
            route.origin.toLowerCase() === origin.toLowerCase() &&
            route.destination.toLowerCase() === destination.toLowerCase(),
      );

export { isScheduleUpcoming };
