const express = require('express');
const Reservation = require('../models/Reservation');
const requireAgencyAdmin = require('../middleware/requireAgencyAdmin');
const { getCampayPaymentStatus } = require('../services/campay');

const router = express.Router();
router.use(requireAgencyAdmin);

router.get('/', async (request, response) => {
   try {
      const reservations = await Reservation.find()
         .populate({
            path: 'scheduleId',
            match: { agencyName: request.agencyAdmin.agencyName },
            populate: [{ path: 'busId' }, { path: 'routeId' }],
         })
         .populate('passengerId', 'name email phone')
         .sort({ createdAt: -1 });
      await Promise.all(
         reservations
            .filter(
               (reservation) =>
                  reservation.paymentStatus === 'Pending' &&
                  reservation.paymentReference,
            )
            .map(async (reservation) => {
               try {
                  const payment = await getCampayPaymentStatus(
                     reservation.paymentReference,
                  );
                  if (payment.normalizedStatus !== 'Pending') {
                     reservation.paymentStatus = payment.normalizedStatus;
                     await reservation.save();
                  }
               } catch (error) {
                  // Keep the existing pending state when Campay is temporarily unavailable.
               }
            }),
      );
      const busId = request.query.busId;
      const bookings = reservations
         .filter((reservation) => reservation.scheduleId)
         .filter(
            (reservation) =>
               !busId || reservation.scheduleId.busId?._id.toString() === busId,
         )
         .map((reservation) => ({
            id: reservation.id,
            passenger: reservation.passengerId,
            seats: reservation.seats,
            ticketAmount: reservation.amount,
            gatewayAmount: reservation.gatewayAmount,
            paymentStatus: reservation.paymentStatus,
            paymentReference: reservation.paymentReference,
            createdAt: reservation.createdAt,
            schedule: reservation.scheduleId,
         }));
      response.json(bookings);
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to load agency bookings right now.' });
   }
});

module.exports = router;
