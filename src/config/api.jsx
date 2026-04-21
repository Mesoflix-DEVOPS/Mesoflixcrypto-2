/**
 * Institutional API Configuration
 * 
 * Centralized endpoint management for the MesoflixLabs platform.
 * Automatically switches between local development and production Render environment.
 */

const getBaseUrl = () => {
  // 1. Check for manual override in environment
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;

  // 2. Deployment context check
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocal) {
    return 'http://localhost:3001';
  }

  // 3. Fallback to production Render URL
  return 'https://mesoflixcrypto-2.onrender.com';
};

export const RENDER_BACKEND_URL = getBaseUrl();

/**
 * Get the standardized API Base URL
 * Ensures all frontend fetches target the correct environment.
 */
export const getApiUrl = (path = '') => {
  const baseUrl = RENDER_BACKEND_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Enhanced fetch with centralized logging to solve "silent" API issues
 */
export const fetchWithLogging = async (url, options = {}) => {
  const startTime = Date.now();
  console.log(`%c[API_REQ] ${options.method || 'GET'} -> ${url}`, 'color: #3b82f6; font-weight: bold;');
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    // Clone response to read body for logging without consuming it
    const clonedResponse = response.clone();
    const contentType = response.headers.get('content-type');
    
    let preview = 'Non-JSON Body';
    if (contentType?.includes('application/json')) {
      try {
        preview = await clonedResponse.json();
      } catch (e) {
        preview = 'Error parsing JSON preview';
      }
    } else {
      try {
        preview = await clonedResponse.text();
        // Truncate long HTML/Text
        if (typeof preview === 'string' && preview.length > 200) {
          preview = preview.substring(0, 200) + '... (truncated)';
        }
      } catch (e) {
        preview = 'Error reading body';
      }
    }

    if (!response.ok) {
      console.error(`%c[API_ERR] ${response.status} (${duration}ms) <- ${url}`, 'color: #ef4444; font-weight: bold;', {
        status: response.status,
        statusText: response.statusText,
        data: preview
      });
    } else {
      console.log(`%c[API_RES] ${response.status} (${duration}ms) <- ${url}`, 'color: #10b981; font-weight: bold;', preview);
    }

    return response;
  } catch (error) {
    console.error(`%c[API_FAIL] Request Failed <- ${url}`, 'color: #ef4444; font-weight: bold; background: #fee2e2;', error);
    throw error;
  }
};

export default {
  baseUrl: RENDER_BACKEND_URL,
  getApiUrl,
  fetchWithLogging
};
