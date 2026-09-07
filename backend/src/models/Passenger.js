const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
   {
      name: { type: String, required: true, trim: true },
      email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
      },
      passwordHash: { type: String, required: true },
      phone: { type: String, default: '', trim: true },
   },
   { timestamps: true },
);

module.exports = mongoose.model('Passenger', passengerSchema);
