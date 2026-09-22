const CAMPAY_BASE_URL =
   process.env.CAMPAY_BASE_URL || 'https://demo.campay.net/api';

const getCampayToken = async () => {
   const response = await fetch(`${CAMPAY_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         username: process.env.CAMPAY_USERNAME,
         password: process.env.CAMPAY_PASSWORD,
      }),
   });
   const data = await response.json().catch(() => ({}));
   if (!response.ok || !data.token) {
      throw new Error(data.detail || 'Campay authentication failed.');
   }
   return data.token;
};

const getGatewayAmount = (ticketAmount) => {
   const divisor = Number(process.env.CAMPAY_TEST_DIVISOR || 10000);
   return Math.max(2, Math.min(3, Math.ceil(ticketAmount / divisor)));
};

const normalizePaymentStatus = (value) => {
   const status = String(value || '').toUpperCase();
   if (
      ['SUCCESSFUL', 'SUCCESS', 'COMPLETED', 'COMPLETED_SUCCESSFULLY'].includes(
         status,
      )
   )
      return 'Completed';
   if (['FAILED', 'CANCELLED', 'CANCELED', 'EXPIRED'].includes(status))
      return 'Failed';
   return 'Pending';
};

const normalizeCameroonPhone = (value) => {
   const digits = String(value || '').replace(/\D/g, '');
   const localNumber = digits.startsWith('237') ? digits.slice(3) : digits;

   if (!/^6\d{8}$/.test(localNumber)) {
      throw new Error(
         'Enter a valid 9-digit Cameroon mobile number, for example 677018361.',
      );
   }

   return `237${localNumber}`;
};

const collectCampayPayment = async ({
   amount,
   phone,
   operator,
   description,
   reference,
}) => {
   const token = await getCampayToken();
   const normalizedPhone = normalizeCameroonPhone(phone);
   const response = await fetch(`${CAMPAY_BASE_URL}/collect/`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
         amount: String(amount),
         currency: 'XAF',
         from: normalizedPhone,
         operator,
         description,
         external_reference: reference,
      }),
   });
   const data = await response.json().catch(() => ({}));
   if (!response.ok)
      throw new Error(
         data.message || data.detail || 'Campay payment request failed.',
      );
   return data;
};

const getCampayPaymentStatus = async (reference) => {
   const token = await getCampayToken();
   const path = (
      process.env.CAMPAY_STATUS_PATH || '/transaction/{reference}/'
   ).replace('{reference}', encodeURIComponent(reference));
   const response = await fetch(`${CAMPAY_BASE_URL}${path}`, {
      headers: { Authorization: `Token ${token}` },
   });
   const data = await response.json().catch(() => ({}));
   if (!response.ok)
      throw new Error(
         data.message || data.detail || 'Campay status lookup failed.',
      );
   return {
      ...data,
      normalizedStatus: normalizePaymentStatus(
         data.status || data.payment_status || data.state,
      ),
   };
};

module.exports = {
   collectCampayPayment,
   getCampayPaymentStatus,
   getGatewayAmount,
   normalizeCameroonPhone,
   normalizePaymentStatus,
};
