const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const agencyAuthRouter = require('./src/routes/agencyAuth');
const agencyCrudRouter = require('./src/routes/agencyCrud');
const passengerAuthRouter = require('./src/routes/passengerAuth');
const publicTripsRouter = require('./src/routes/publicTrips');
const reservationsRouter = require('./src/routes/reservations');
const seedAgencyAdmin = require('./src/services/seedAgencyAdmin');
const seedAgencyData = require('./src/services/seedAgencyData');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
   cors({
      origin: true,
      credentials: true,
   }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth/agency', agencyAuthRouter);
app.use('/api/agency', agencyCrudRouter);
app.use('/api/auth/passenger', passengerAuthRouter);
app.use('/api/public', publicTripsRouter);
app.use('/api/reservations', reservationsRouter);

app.get('/api/health', (request, response) => {
   response.json({
      status: 'ok',
      service: 'busby-backend',
      database: 'connected',
   });
});

async function startServer() {
   try {
      await connectDB();
      await seedAgencyAdmin();
      await seedAgencyData();

      app.listen(port, () => {
         console.log(`BusBy backend running on port ${port}`);
      });
   } catch (error) {
      console.error('Failed to start backend:', error.message);
      process.exit(1);
   }
}

startServer();
