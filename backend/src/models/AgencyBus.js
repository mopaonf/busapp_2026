const mongoose = require('mongoose');

const agencyBusSchema = new mongoose.Schema(
   {
      agencyName: { type: String, required: true, index: true },
      name: { type: String, required: true, trim: true },
      plate: { type: String, required: true, trim: true },
      driver: { type: String, default: '', trim: true },
      status: {
         type: String,
         enum: ['Active', 'Maintenance', 'Inactive'],
         default: 'Active',
      },
      type: {
         type: String,
         enum: ['VIP', 'Classic', 'Standard'],
         default: 'Standard',
      },
      capacity: { type: Number, required: true, min: 1 },
      seatLayout: { type: mongoose.Schema.Types.Mixed, default: {} },
      amenities: { type: [String], default: [] },
   },
   { timestamps: true },
);

module.exports = mongoose.model('AgencyBus', agencyBusSchema);
