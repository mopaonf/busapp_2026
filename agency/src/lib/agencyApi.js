const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function agencyRequest(token, path, options = {}) {
   const response = await fetch(`${API_URL}/agency${path}`, {
      ...options,
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
         ...(options.headers || {}),
      },
   });

   if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Unable to complete request.');
   }

   return response.status === 204 ? null : response.json();
}
