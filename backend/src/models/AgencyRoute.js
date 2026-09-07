const mongoose = require('mongoose');

const agencyRouteSchema = new mongoose.Schema(
   {
      agencyName: { type: String, required: true, index: true },
      name: { type: String, required: true, trim: true },
      origin: { type: String, required: true, trim: true, lowercase: true },
      originRegion: { type: String, default: '' },
      destination: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
      },
      destinationRegion: { type: String, default: '' },
      baseFare: { type: Number, required: true, min: 0 },
      distance: { type: String, default: '' },
      estimatedDuration: { type: String, default: '' },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
   },
   { timestamps: true },
);

agencyRouteSchema.index(
   { agencyName: 1, origin: 1, destination: 1 },
   { unique: true },
);

module.exports = mongoose.model('AgencyRoute', agencyRouteSchema);
