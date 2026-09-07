const mongoose = require('mongoose');

const agencyPricingSchema = new mongoose.Schema(
   {
      agencyName: { type: String, required: true, unique: true, index: true },
      tierMarkups: {
         Standard: { type: Number, default: 0, min: 0 },
         Classic: { type: Number, default: 2000, min: 0 },
         VIP: { type: Number, default: 5000, min: 0 },
      },
   },
   { timestamps: true },
);

module.exports = mongoose.model('AgencyPricing', agencyPricingSchema);
