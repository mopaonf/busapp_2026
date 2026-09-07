const express = require('express');
const AgencySchedule = require('../models/AgencySchedule');
const Reservation = require('../models/Reservation');
const requirePassenger = require('../middleware/requirePassenger');

const router = express.Router();
router.use(requirePassenger);

router.post('/', async (request, response) => {
   try {
      const schedule = await AgencySchedule.findOne({
         _id: request.body.scheduleId,
         status: 'Published',
      }).populate('busId routeId');
      const seats = [...new Set((request.body.seats || []).map(String))];

      if (!schedule)
         return response
            .status(404)
            .json({ message: 'This trip is no longer available.' });
      if (!seats.length)
         return response
            .status(400)
            .json({ message: 'Select at least one seat.' });
      if (seats.length > schedule.availableSeats)
         return response
            .status(409)
            .json({ message: 'Not enough seats remain for this trip.' });

      const existingReservation = await Reservation.findOne({
         scheduleId: schedule.id,
         status: 'Confirmed',
         seats: { $in: seats },
      });
      if (existingReservation)
         return response
            .status(409)
            .json({
               message: 'One or more selected seats have just been reserved.',
            });

      const updatedSchedule = await AgencySchedule.findOneAndUpdate(
         {
            _id: schedule.id,
            status: 'Published',
            availableSeats: { $gte: seats.length },
         },
         { $inc: { availableSeats: -seats.length } },
         { new: true },
      );
      if (!updatedSchedule)
         return response
            .status(409)
            .json({
               message:
                  'These seats are no longer available. Please search again.',
            });

      try {
         const reservation = await Reservation.create({
            passengerId: request.passenger.id,
            scheduleId: schedule.id,
            seats,
            amount: seats.length * schedule.totalFare,
         });
         response
            .status(201)
            .json({
               reservation,
               availableSeats: updatedSchedule.availableSeats,
            });
      } catch (error) {
         await AgencySchedule.updateOne(
            { _id: schedule.id },
            { $inc: { availableSeats: seats.length } },
         );
         if (error.code === 11000)
            return response
               .status(409)
               .json({
                  message:
                     'One or more selected seats have just been reserved.',
               });
         throw error;
      }
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to complete the reservation right now.' });
   }
});

module.exports = router;
