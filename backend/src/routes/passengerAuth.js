const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Passenger = require('../models/Passenger');

const router = express.Router();

const publicPassenger = (passenger) => ({
   id: passenger.id,
   name: passenger.name,
   email: passenger.email,
   phone: passenger.phone,
});

const issueToken = (passenger) =>
   jwt.sign({ sub: passenger.id, role: 'passenger' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
   });

router.post('/register', async (request, response) => {
   try {
      const { name, email, password, phone = '' } = request.body;
      if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
         return response
            .status(400)
            .json({
               message:
                  'Name, email, and a password of at least 8 characters are required.',
            });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (await Passenger.exists({ email: normalizedEmail })) {
         return response
            .status(409)
            .json({ message: 'An account with this email already exists.' });
      }

      const passenger = await Passenger.create({
         name: name.trim(),
         email: normalizedEmail,
         phone,
         passwordHash: await bcrypt.hash(password, 12),
      });
      response
         .status(201)
         .json({
            token: issueToken(passenger),
            passenger: publicPassenger(passenger),
         });
   } catch (error) {
      response
         .status(500)
         .json({ message: 'Unable to create your account right now.' });
   }
});

router.post('/login', async (request, response) => {
   try {
      const email = request.body.email?.trim().toLowerCase();
      const passenger = email ? await Passenger.findOne({ email }) : null;
      const matches = passenger
         ? await bcrypt.compare(
              request.body.password || '',
              passenger.passwordHash,
           )
         : false;
      if (!passenger || !matches)
         return response
            .status(401)
            .json({ message: 'Invalid email or password.' });
      response.json({
         token: issueToken(passenger),
         passenger: publicPassenger(passenger),
      });
   } catch (error) {
      response.status(500).json({ message: 'Unable to sign in right now.' });
   }
});

module.exports = router;
