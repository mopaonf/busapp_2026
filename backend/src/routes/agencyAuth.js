const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AgencyAdmin = require('../models/AgencyAdmin');

const router = express.Router();

const createToken = (admin) =>
   jwt.sign(
      {
         sub: admin.id,
         role: admin.role,
         agencyName: admin.agencyName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
   );

const toPublicAdmin = (admin) => ({
   id: admin.id,
   username: admin.username,
   displayName: admin.displayName,
   agencyName: admin.agencyName,
   role: admin.role,
});

const requireAgencyAdmin = async (request, response, next) => {
   try {
      const authorization = request.get('authorization');
      const token = authorization?.startsWith('Bearer ')
         ? authorization.slice(7)
         : null;

      if (!token) {
         return response
            .status(401)
            .json({ message: 'Authentication required.' });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await AgencyAdmin.findById(payload.sub);

      if (!admin?.isActive) {
         return response.status(401).json({ message: 'Account is inactive.' });
      }

      request.agencyAdmin = admin;
      next();
   } catch (error) {
      return response
         .status(401)
         .json({ message: 'Invalid or expired session.' });
   }
};

router.post('/login', async (request, response) => {
   try {
      const username = request.body.username?.trim().toLowerCase();
      const password = request.body.password;

      if (!username || !password) {
         return response
            .status(400)
            .json({ message: 'Username and password are required.' });
      }

      const admin = await AgencyAdmin.findOne({ username });
      const passwordMatches = admin
         ? await bcrypt.compare(password, admin.passwordHash)
         : false;

      if (!admin || !passwordMatches || !admin.isActive) {
         return response
            .status(401)
            .json({ message: 'Invalid login details.' });
      }

      return response.json({
         token: createToken(admin),
         admin: toPublicAdmin(admin),
      });
   } catch (error) {
      return response
         .status(500)
         .json({ message: 'Unable to sign in right now.' });
   }
});

router.get('/me', requireAgencyAdmin, (request, response) => {
   response.json({ admin: toPublicAdmin(request.agencyAdmin) });
});

module.exports = router;
