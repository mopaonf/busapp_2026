const express = require('express');
const AgencyBus = require('../models/AgencyBus');
const AgencyRoute = require('../models/AgencyRoute');
const AgencySchedule = require('../models/AgencySchedule');
const AgencyPricing = require('../models/AgencyPricing');
const requireAgencyAdmin = require('../middleware/requireAgencyAdmin');

const router = express.Router();
router.use(requireAgencyAdmin);

const scoped = (request) => ({ agencyName: request.agencyAdmin.agencyName });
const handleError = (response, error) => {
   if (error.code === 11000)
      return response
         .status(409)
         .json({ message: 'This agency already has that route.' });
   return response
      .status(400)
      .json({ message: error.message || 'Invalid request.' });
};

const exactIgnoreCase = (value) =>
   new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

async function assertBusAvailability({
   bus,
   date,
   takeoffTime,
   arrivalTime,
   excludeId,
}) {
   if (bus.status === 'Maintenance') {
      const error = new Error(
         'This bus is under maintenance and cannot be scheduled.',
      );
      error.statusCode = 409;
      throw error;
   }

   if (!date || !takeoffTime || !arrivalTime || takeoffTime >= arrivalTime) {
      const error = new Error(
         'Schedule times must include a valid same-day interval.',
      );
      error.statusCode = 400;
      throw error;
   }

   const conflict = await AgencySchedule.findOne({
      agencyName: bus.agencyName,
      busId: bus.id,
      date,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      takeoffTime: { $lt: arrivalTime },
      arrivalTime: { $gt: takeoffTime },
   });

   if (conflict) {
      const error = new Error(
         'This bus is already assigned to another trip during that time.',
      );
      error.statusCode = 409;
      throw error;
   }
}

router.get('/pricing', async (request, response) => {
   const pricing = await AgencyPricing.findOne(scoped(request));
   response.json(
      pricing || {
         agencyName: request.agencyAdmin.agencyName,
         tierMarkups: { Standard: 0, Classic: 2000, VIP: 5000 },
      },
   );
});

router.patch('/pricing', async (request, response) => {
   try {
      const tierMarkups = Object.fromEntries(
         ['Standard', 'Classic', 'VIP'].map((tier) => [
            tier,
            Math.max(0, Number(request.body.tierMarkups?.[tier]) || 0),
         ]),
      );
      const pricing = await AgencyPricing.findOneAndUpdate(
         scoped(request),
         { ...scoped(request), tierMarkups },
         {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
         },
      );
      response.json(pricing);
   } catch (error) {
      if (error.statusCode) {
         return response
            .status(error.statusCode)
            .json({ message: error.message });
      }
      handleError(response, error);
   }
});

router.get('/buses', async (request, response) =>
   response.json(await AgencyBus.find(scoped(request)).sort({ createdAt: -1 })),
);
router.post('/buses', async (request, response) => {
   try {
      response
         .status(201)
         .json(await AgencyBus.create({ ...request.body, ...scoped(request) }));
   } catch (error) {
      handleError(response, error);
   }
});
router.patch('/buses/:id', async (request, response) => {
   try {
      const bus = await AgencyBus.findOneAndUpdate(
         { _id: request.params.id, ...scoped(request) },
         request.body,
         { new: true, runValidators: true },
      );
      if (!bus) return response.status(404).json({ message: 'Bus not found.' });
      response.json(bus);
   } catch (error) {
      handleError(response, error);
   }
});
router.delete('/buses/:id', async (request, response) => {
   const bus = await AgencyBus.findOneAndDelete({
      _id: request.params.id,
      ...scoped(request),
   });
   if (!bus) return response.status(404).json({ message: 'Bus not found.' });
   await AgencySchedule.deleteMany({ busId: bus.id, ...scoped(request) });
   response.status(204).end();
});

router.get('/routes', async (request, response) =>
   response.json(
      await AgencyRoute.find(scoped(request)).sort({ createdAt: -1 }),
   ),
);
router.post('/routes', async (request, response) => {
   try {
      const origin = request.body.origin?.trim().toLowerCase();
      const destination = request.body.destination?.trim().toLowerCase();
      if (!origin || !destination || origin === destination) {
         return response
            .status(400)
            .json({ message: 'Choose two different route cities.' });
      }
      const duplicate = await AgencyRoute.exists({
         ...scoped(request),
         origin: exactIgnoreCase(origin),
         destination: exactIgnoreCase(destination),
      });
      if (duplicate) {
         return response
            .status(409)
            .json({ message: 'This agency already has that route.' });
      }
      response.status(201).json(
         await AgencyRoute.create({
            ...request.body,
            origin,
            destination,
            ...scoped(request),
         }),
      );
   } catch (error) {
      handleError(response, error);
   }
});
router.patch('/routes/:id', async (request, response) => {
   try {
      const origin = request.body.origin?.trim().toLowerCase();
      const destination = request.body.destination?.trim().toLowerCase();
      if (origin && destination && origin === destination) {
         return response
            .status(400)
            .json({ message: 'Choose two different route cities.' });
      }
      if (origin && destination) {
         const duplicate = await AgencyRoute.exists({
            ...scoped(request),
            origin: exactIgnoreCase(origin),
            destination: exactIgnoreCase(destination),
            _id: { $ne: request.params.id },
         });
         if (duplicate)
            return response
               .status(409)
               .json({ message: 'This agency already has that route.' });
      }
      const route = await AgencyRoute.findOneAndUpdate(
         { _id: request.params.id, ...scoped(request) },
         {
            ...request.body,
            ...(origin ? { origin } : {}),
            ...(destination ? { destination } : {}),
         },
         { new: true, runValidators: true },
      );
      if (!route)
         return response.status(404).json({ message: 'Route not found.' });
      response.json(route);
   } catch (error) {
      handleError(response, error);
   }
});
router.delete('/routes/:id', async (request, response) => {
   const route = await AgencyRoute.findOneAndDelete({
      _id: request.params.id,
      ...scoped(request),
   });
   if (!route)
      return response.status(404).json({ message: 'Route not found.' });
   await AgencySchedule.deleteMany({ routeId: route.id, ...scoped(request) });
   response.status(204).end();
});

router.get('/schedules', async (request, response) => {
   const schedules = await AgencySchedule.find(scoped(request))
      .populate('busId routeId')
      .sort({ createdAt: -1 });
   response.json(schedules);
});
router.post('/schedules', async (request, response) => {
   try {
      const [bus, route, pricing] = await Promise.all([
         AgencyBus.findOne({ _id: request.body.busId, ...scoped(request) }),
         AgencyRoute.findOne({ _id: request.body.routeId, ...scoped(request) }),
         AgencyPricing.findOne(scoped(request)),
      ]);
      if (!bus) return response.status(404).json({ message: 'Bus not found.' });
      if (!route)
         return response.status(404).json({ message: 'Route not found.' });
      await assertBusAvailability({
         bus,
         date: request.body.date,
         takeoffTime: request.body.takeoffTime,
         arrivalTime: request.body.arrivalTime,
      });

      const tierMarkup =
         pricing?.tierMarkups?.[bus.type] ??
         { Standard: 0, Classic: 2000, VIP: 5000 }[bus.type] ??
         0;
      const schedule = await AgencySchedule.create({
         ...request.body,
         ...scoped(request),
         baseFare: route.baseFare,
         tierMarkup,
         totalFare: route.baseFare + tierMarkup,
         availableSeats: bus.capacity,
      });
      response.status(201).json(await schedule.populate('busId routeId'));
   } catch (error) {
      if (error.statusCode) {
         return response
            .status(error.statusCode)
            .json({ message: error.message });
      }
      handleError(response, error);
   }
});
router.patch('/schedules/:id', async (request, response) => {
   try {
      const currentSchedule = await AgencySchedule.findOne({
         _id: request.params.id,
         ...scoped(request),
      });
      if (!currentSchedule)
         return response.status(404).json({ message: 'Schedule not found.' });

      const busId = request.body.busId || currentSchedule.busId;
      const bus = await AgencyBus.findOne({ _id: busId, ...scoped(request) });
      if (!bus) return response.status(404).json({ message: 'Bus not found.' });
      await assertBusAvailability({
         bus,
         date: request.body.date || currentSchedule.date,
         takeoffTime: request.body.takeoffTime || currentSchedule.takeoffTime,
         arrivalTime: request.body.arrivalTime || currentSchedule.arrivalTime,
         excludeId: currentSchedule.id,
      });

      const schedule = await AgencySchedule.findOneAndUpdate(
         { _id: request.params.id, ...scoped(request) },
         request.body,
         { new: true, runValidators: true },
      ).populate('busId routeId');
      if (!schedule)
         return response.status(404).json({ message: 'Schedule not found.' });
      response.json(schedule);
   } catch (error) {
      if (error.statusCode) {
         return response
            .status(error.statusCode)
            .json({ message: error.message });
      }
      handleError(response, error);
   }
});
router.delete('/schedules/:id', async (request, response) => {
   const schedule = await AgencySchedule.findOneAndDelete({
      _id: request.params.id,
      ...scoped(request),
   });
   if (!schedule)
      return response.status(404).json({ message: 'Schedule not found.' });
   response.status(204).end();
});

module.exports = router;
