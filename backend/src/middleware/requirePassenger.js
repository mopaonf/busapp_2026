const jwt = require('jsonwebtoken');
const Passenger = require('../models/Passenger');

async function requirePassenger(request, response, next) {
   try {
      const authorization = request.get('authorization');
      const token = authorization?.startsWith('Bearer ')
         ? authorization.slice(7)
         : null;
      if (!token)
         return response
            .status(401)
            .json({ message: 'Sign in before making a reservation.' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role !== 'passenger')
         return response
            .status(403)
            .json({ message: 'Passenger account required.' });
      const passenger = await Passenger.findById(payload.sub);
      if (!passenger)
         return response
            .status(401)
            .json({ message: 'Passenger account was not found.' });

      request.passenger = passenger;
      next();
   } catch (error) {
      response
         .status(401)
         .json({
            message:
               'Your passenger session has expired. Please sign in again.',
         });
   }
}

module.exports = requirePassenger;
