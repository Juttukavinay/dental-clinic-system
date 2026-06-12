const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Local development fallback
  if (window.location.port === '3000' || window.location.port === '5173') {
    return 'http://localhost:5000/api';
  }
  // Monolithic production path
  return '/api';
};

const BASE_URL = getBaseUrl();

/**
 * Custom fetch client wrapper that handles JWT authentication headers
 * and parses response results or PDF blobs.
 */
export const apiClient = async (endpoint, { body, isForm = false, ...customConfig } = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = isForm ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Check if response is a PDF attachment blob
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return await response.blob();
    }

    const data = await response.json();
    if (response.ok) {
      return data;
    }
    
    throw new Error(data.error || 'Request failed.');
  } catch (error) {
    console.error('API Client Error:', error);
    return Promise.reject(error.message || error);
  }
};
