const bcrypt = require('bcryptjs');
const AgencyAdmin = require('../models/AgencyAdmin');

async function seedAgencyAdmin() {
   const agencyAdmins = [
      {
         username: 'finexxadmin',
         password: 'finexxadmin123',
         displayName: 'Finexx Admin',
         agencyName: 'Finexx Voyages',
      },
      {
         username: 'bucaadmin',
         password: 'bucaadmin123',
         displayName: 'Buca Admin',
         agencyName: 'Buca Voyages',
      },
      {
         username: 'musangoadmin',
         password: 'musangoadmin123',
         displayName: 'Musango Admin',
         agencyName: 'Musango Bus Service',
      },
   ];

   for (const agencyAdmin of agencyAdmins) {
      const existingAdmin = await AgencyAdmin.findOne({
         username: agencyAdmin.username,
      });
      if (existingAdmin) continue;

      const passwordHash = await bcrypt.hash(agencyAdmin.password, 12);
      await AgencyAdmin.create({
         username: agencyAdmin.username,
         passwordHash,
         displayName: agencyAdmin.displayName,
         agencyName: agencyAdmin.agencyName,
      });

      console.log(`Seeded agency admin account: ${agencyAdmin.username}`);
   }
}

module.exports = seedAgencyAdmin;
