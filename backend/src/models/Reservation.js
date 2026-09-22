const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
   {
      passengerId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Passenger',
         required: true,
      },
      scheduleId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'AgencySchedule',
         required: true,
      },
      seats: {
         type: [String],
         required: true,
         validate: (value) => value.length > 0,
      },
      amount: { type: Number, required: true, min: 0 },
      gatewayAmount: { type: Number, required: true, min: 0 },
      gateway: { type: String, default: 'campay' },
      paymentOperator: {
         type: String,
         enum: ['MTN', 'ORANGE'],
         default: 'MTN',
      },
      paymentReference: { type: String, default: '' },
      paymentStatus: {
         type: String,
         enum: ['Pending', 'Completed', 'Failed'],
         default: 'Pending',
      },
      status: {
         type: String,
         enum: ['Confirmed', 'Cancelled'],
         default: 'Confirmed',
      },
   },
   { timestamps: true },
);

reservationSchema.index({ scheduleId: 1, seats: 1 }, { unique: true });

module.exports = mongoose.model('Reservation', reservationSchema);
