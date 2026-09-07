const AgencyBus = require('../models/AgencyBus');
const AgencyRoute = require('../models/AgencyRoute');
const AgencySchedule = require('../models/AgencySchedule');
const AgencyPricing = require('../models/AgencyPricing');

const agencyName = 'Finexx Voyages';

const getFutureDate = (daysFromToday) => {
   const date = new Date();
   date.setDate(date.getDate() + daysFromToday);
   return date.toISOString().slice(0, 10);
};

async function seedAgencyData() {
   await AgencyPricing.findOneAndUpdate(
      { agencyName },
      { agencyName, tierMarkups: { Standard: 0, Classic: 2000, VIP: 5000 } },
      { upsert: true, setDefaultsOnInsert: true },
   );

   const hasBuses = await AgencyBus.exists({ agencyName });
   if (hasBuses) {
      const today = new Date().toISOString().slice(0, 10);
      await AgencySchedule.updateMany(
         { agencyName, date: { $lt: today }, status: 'Published' },
         { $set: { date: getFutureDate(1) } },
      );
      return;
   }

   const buses = await AgencyBus.insertMany([
      {
         agencyName,
         name: 'Finexs 01',
         plate: 'CE-421-19',
         driver: 'Patrick E.',
         type: 'VIP',
         capacity: 50,
         status: 'Active',
         amenities: ['wifi', 'ac', 'charging'],
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
         agencyName,
         name: 'Finexs 02',
         plate: 'CE-422-19',
         driver: 'Jean M.',
         type: 'Classic',
         capacity: 52,
         status: 'Maintenance',
         amenities: ['ac', 'luggage'],
         seatLayout: {
            totalSeats: 52,
            seatsPerRow: 4,
            layoutSections: [2, 2],
            isDoubleDecker: false,
            lowerDeck: { seatCount: 52, startSeat: 1, frontSeatCount: 2 },
         },
      },
      {
         agencyName,
         name: 'Finexs 03',
         plate: 'CE-423-19',
         driver: 'Albert N.',
         type: 'Standard',
         capacity: 40,
         status: 'Active',
         amenities: ['ac', 'luggage'],
         seatLayout: {
            totalSeats: 40,
            seatsPerRow: 4,
            layoutSections: [2, 2],
            isDoubleDecker: false,
            lowerDeck: { seatCount: 40, startSeat: 1, frontSeatCount: 1 },
         },
      },
   ]);

   const routes = await AgencyRoute.insertMany([
      {
         agencyName,
         name: 'Douala to Yaounde',
         origin: 'Douala',
         originRegion: 'Littoral',
         destination: 'Yaounde',
         destinationRegion: 'Centre',
         baseFare: 4500,
         distance: '245 km',
         estimatedDuration: '3.5 hrs',
         status: 'Active',
      },
      {
         agencyName,
         name: 'Bamenda to Douala',
         origin: 'Bamenda',
         originRegion: 'North West',
         destination: 'Douala',
         destinationRegion: 'Littoral',
         baseFare: 6000,
         distance: '310 km',
         estimatedDuration: '5.0 hrs',
         status: 'Active',
      },
      {
         agencyName,
         name: 'Buea to Yaounde',
         origin: 'Buea',
         originRegion: 'South West',
         destination: 'Yaounde',
         destinationRegion: 'Centre',
         baseFare: 5000,
         distance: '290 km',
         estimatedDuration: '4.5 hrs',
         status: 'Active',
      },
      {
         agencyName,
         name: 'Kumba to Douala',
         origin: 'Kumba',
         originRegion: 'South West',
         destination: 'Douala',
         destinationRegion: 'Littoral',
         baseFare: 3500,
         distance: '120 km',
         estimatedDuration: '2.5 hrs',
         status: 'Inactive',
      },
   ]);

   const busByName = Object.fromEntries(buses.map((bus) => [bus.name, bus]));
   const routeByName = Object.fromEntries(
      routes.map((route) => [route.name, route]),
   );
   await AgencySchedule.insertMany([
      {
         agencyName,
         date: getFutureDate(1),
         takeoffTime: '06:30',
         arrivalTime: '10:00',
         routeId: routeByName['Douala to Yaounde']._id,
         busId: busByName['Finexs 01']._id,
         availableSeats: 22,
         baseFare: 4500,
         tierMarkup: 5000,
         totalFare: 9500,
         status: 'Published',
      },
      {
         agencyName,
         date: getFutureDate(2),
         takeoffTime: '09:15',
         arrivalTime: '13:45',
         routeId: routeByName['Buea to Yaounde']._id,
         busId: busByName['Finexs 03']._id,
         availableSeats: 15,
         baseFare: 5000,
         tierMarkup: 0,
         totalFare: 5000,
         status: 'Draft',
      },
      {
         agencyName,
         date: getFutureDate(3),
         takeoffTime: '14:00',
         arrivalTime: '19:00',
         routeId: routeByName['Bamenda to Douala']._id,
         busId: busByName['Finexs 02']._id,
         availableSeats: 38,
         baseFare: 6000,
         tierMarkup: 2000,
         totalFare: 8000,
         status: 'Published',
      },
   ]);

   console.log('Seeded Finexx agency buses, routes, and schedules');
}

module.exports = seedAgencyData;
