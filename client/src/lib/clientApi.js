const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
   const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
         'Content-Type': 'application/json',
         ...(options.headers || {}),
      },
   });
   const data = await response.json().catch(() => ({}));
   if (!response.ok)
      throw new Error(data.message || 'Unable to complete request.');
   return data;
}

export const searchTrips = (search) => {
   const params = new URLSearchParams({
      origin: search.origin,
      destination: search.destination,
      seats: String(search.seats),
   });
   return request(`/public/trips?${params}`);
};

export const getLocations = () => request('/public/locations');

export const passengerLogin = (credentials) =>
   request('/auth/passenger/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
   });

export const passengerRegister = (details) =>
   request('/auth/passenger/register', {
      method: 'POST',
      body: JSON.stringify(details),
   });

export const createReservation = (token, details) =>
   request('/reservations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(details),
   });

export const getReservationStatus = (token, reservationId) =>
   request(`/reservations/${reservationId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
   });
