const mongoose = require('mongoose');

const normalizeMongoUri = (value) => value?.trim().replace(/^['"]|['"]$/g, '');

async function connectDB() {
   const mongoUri = normalizeMongoUri(process.env.MONGO_URI);

   if (!mongoUri) {
      throw new Error('MONGO_URI is not configured.');
   }

   mongoose.set('strictQuery', true);
   await mongoose.connect(mongoUri);

   console.log('MongoDB connected');
}

module.exports = connectDB;
