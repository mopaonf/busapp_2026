const express = require('express');
const AgencySchedule = require('../models/AgencySchedule');
const AgencyRoute = require('../models/AgencyRoute');

const router = express.Router();

router.get('/locations', async (request, response) => {
   try {
      const routes = await AgencyRoute.find({ status: 'Active' }).select(
         'origin destination',
      );
      response.json(
         [
            ...new Set(
               routes.flatMap((route) => [route.origin, route.destination]),
            ),
         ].sort(),
      );
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to load locations right now.' });
   }
});

const isUpcoming = (schedule) => {
   const departure = new Date(`${schedule.date}T${schedule.takeoffTime}:00`);
   return !Number.isNaN(departure.getTime()) && departure >= new Date();
};

router.get('/trips', async (request, response) => {
   try {
      const origin = request.query.origin?.trim().toLowerCase();
      const destination = request.query.destination?.trim().toLowerCase();
      const seats = Math.max(1, Number(request.query.seats) || 1);
      const schedules = await AgencySchedule.find({
         status: 'Published',
         availableSeats: { $gte: seats },
      })
         .populate('busId routeId')
         .sort({ date: 1, takeoffTime: 1 });

      const trips = schedules
         .filter((schedule) => isUpcoming(schedule))
         .filter(
            (schedule) =>
               !origin || schedule.routeId?.origin?.toLowerCase() === origin,
         )
         .filter(
            (schedule) =>
               !destination ||
               schedule.routeId?.destination?.toLowerCase() === destination,
         )
         .map((schedule) => ({
            id: schedule.id,
            date: schedule.date,
            takeoffTime: schedule.takeoffTime,
            arrivalTime: schedule.arrivalTime,
            availableSeats: schedule.availableSeats,
            totalFare: schedule.totalFare,
            agency: { name: schedule.agencyName, rating: 4.8 },
            bus: schedule.busId,
            route: schedule.routeId,
         }));

      response.json(trips);
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to load available trips right now.' });
   }
});

module.exports = router;
