const mongoose = require('mongoose');

const agencyScheduleSchema = new mongoose.Schema(
   {
      agencyName: { type: String, required: true, index: true },
      date: { type: String, required: true },
      takeoffTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      routeId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'AgencyRoute',
         required: true,
      },
      busId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'AgencyBus',
         required: true,
      },
      availableSeats: { type: Number, required: true, min: 0 },
      baseFare: { type: Number, required: true, min: 0 },
      tierMarkup: { type: Number, default: 0, min: 0 },
      totalFare: { type: Number, required: true, min: 0 },
      status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
   },
   { timestamps: true },
);

module.exports = mongoose.model('AgencySchedule', agencyScheduleSchema);
