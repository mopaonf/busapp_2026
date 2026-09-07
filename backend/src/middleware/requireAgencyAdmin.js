const jwt = require('jsonwebtoken');
const AgencyAdmin = require('../models/AgencyAdmin');

async function requireAgencyAdmin(request, response, next) {
   try {
      const authorization = request.get('authorization');
      const token = authorization?.startsWith('Bearer ')
         ? authorization.slice(7)
         : null;

      if (!token)
         return response
            .status(401)
            .json({ message: 'Authentication required.' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await AgencyAdmin.findById(payload.sub);
      if (!admin?.isActive)
         return response.status(401).json({ message: 'Account is inactive.' });

      request.agencyAdmin = admin;
      next();
   } catch (error) {
      response.status(401).json({ message: 'Invalid or expired session.' });
   }
}

module.exports = requireAgencyAdmin;
