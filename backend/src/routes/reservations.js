const express = require('express');
const AgencySchedule = require('../models/AgencySchedule');
const Reservation = require('../models/Reservation');
const requirePassenger = require('../middleware/requirePassenger');
const {
   collectCampayPayment,
   getGatewayAmount,
   normalizePaymentStatus,
   getCampayPaymentStatus,
} = require('../services/campay');

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

      if (!request.body.phone)
         return response.status(400).json({
            message: 'A mobile money phone number is required for payment.',
         });
      if (!['MTN', 'ORANGE'].includes(request.body.operator))
         return response
            .status(400)
            .json({ message: 'Choose MTN Mobile Money or Orange Money.' });

      const ticketAmount = seats.length * schedule.totalFare;
      const gatewayAmount = getGatewayAmount(ticketAmount);
      const paymentReference = `BUSBY-${schedule.id}-${request.passenger.id}-${Date.now()}`;
      let payment;
      try {
         payment = await collectCampayPayment({
            amount: gatewayAmount,
            phone: request.body.phone,
            operator: request.body.operator,
            description: `BusBy test payment for ${ticketAmount} XAF ticket`,
            reference: paymentReference,
         });
      } catch (error) {
         return response.status(502).json({
            message: `Payment could not be started: ${error.message}`,
         });
      }

      const existingReservation = await Reservation.findOne({
         scheduleId: schedule.id,
         status: 'Confirmed',
         seats: { $in: seats },
      });
      if (existingReservation)
         return response.status(409).json({
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
         return response.status(409).json({
            message:
               'These seats are no longer available. Please search again.',
         });

      try {
         const reservation = await Reservation.create({
            passengerId: request.passenger.id,
            scheduleId: schedule.id,
            seats,
            amount: ticketAmount,
            gatewayAmount,
            paymentReference:
               payment.reference ||
               payment.external_reference ||
               paymentReference,
            paymentOperator: request.body.operator,
            paymentStatus: normalizePaymentStatus(
               payment.status || payment.payment_status || payment.state,
            ),
         });
         response.status(201).json({
            reservation,
            reservationId: reservation._id,
            availableSeats: updatedSchedule.availableSeats,
            payment,
         });
      } catch (error) {
         await AgencySchedule.updateOne(
            { _id: schedule.id },
            { $inc: { availableSeats: seats.length } },
         );
         if (error.code === 11000)
            return response.status(409).json({
               message: 'One or more selected seats have just been reserved.',
            });
         throw error;
      }
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to complete the reservation right now.' });
   }
});

router.get('/:id/status', async (request, response) => {
   try {
      if (!/^[a-f\d]{24}$/i.test(request.params.id))
         return response
            .status(400)
            .json({ message: 'Invalid reservation reference.' });

      const reservation = await Reservation.findOne({
         _id: request.params.id,
         passengerId: request.passenger.id,
      });
      if (!reservation)
         return response
            .status(404)
            .json({ message: 'Reservation not found.' });
      if (
         reservation.paymentStatus === 'Pending' &&
         reservation.paymentReference
      ) {
         const payment = await getCampayPaymentStatus(
            reservation.paymentReference,
         );
         if (payment.normalizedStatus !== 'Pending') {
            reservation.paymentStatus = payment.normalizedStatus;
            await reservation.save();
         }
         return response.json({ reservation, payment });
      }
      response.json({ reservation });
   } catch (error) {
      response.status(502).json({
         message: `Unable to refresh payment status: ${error.message}`,
      });
   }
});

module.exports = router;
