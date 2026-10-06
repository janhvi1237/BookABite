import { api } from './client';

export function fetchOwnerBilling() {
  return api.get('/api/owner/billing');
}

export function payOwnerDues(paymentMethod) {
  return api.post('/api/owner/billing/pay', { payment_method: paymentMethod });
}
