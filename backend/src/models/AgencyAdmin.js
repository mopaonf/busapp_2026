const mongoose = require('mongoose');

const agencyAdminSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
      },
      passwordHash: {
         type: String,
         required: true,
      },
      displayName: {
         type: String,
         required: true,
         trim: true,
      },
      agencyName: {
         type: String,
         required: true,
         trim: true,
      },
      role: {
         type: String,
         default: 'agency_admin',
      },
      isActive: {
         type: Boolean,
         default: true,
      },
   },
   { timestamps: true },
);

module.exports = mongoose.model('AgencyAdmin', agencyAdminSchema);
