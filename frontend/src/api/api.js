/**
 * FairEstate AI — API Client
 * Handles all communication with the FastAPI backend.
 */
import axios from 'axios';

// Base URL for the API — proxied through Vite in development
const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * POST /predict — Full property analysis
 * @param {Object} propertyData - Property features + asking price
 * @returns {Promise<Object>} Complete analysis from all 5 agents
 */
export const predictProperty = async (propertyData) => {
  const response = await api.post('/predict', propertyData);
  return response.data;
};

/**
 * GET /metrics — Model comparison metrics
 * @returns {Promise<Object>} Model names, MAE, RMSE, R² scores
 */
export const getMetrics = async () => {
  const response = await api.get('/metrics');
  return response.data;
};

/**
 * GET /feature-importance — Feature importance values
 * @returns {Promise<Object>} Feature importance from best model
 */
export const getFeatureImportance = async () => {
  const response = await api.get('/feature-importance');
  return response.data;
};

/**
 * GET /health — Health check
 * @returns {Promise<Object>} API status
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
