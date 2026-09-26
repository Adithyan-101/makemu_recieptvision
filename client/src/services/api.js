import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

export const analyzeReceipt = (formData, isDemo = false) => {
  const url = isDemo ? '/receipts/analyze?demo=true' : '/receipts/analyze';
  return api.post(url, formData, {
    headers: isDemo ? {} : { 'Content-Type': 'multipart/form-data' }
  });
};

export const getReceipt = (id) => api.get(`/receipts/${id}`);
export const getReceipts = () => api.get('/receipts');
export const getDashboard = () => api.get('/dashboard');
export const getWasteRules = () => api.get('/waste-rules');
export const getWasteRule = (category) => api.get(`/waste-rules/${encodeURIComponent(category)}`);
export const searchProducts = (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`);

export default api;
