/**
 * Institutional API Configuration
 * 
 * Centralized endpoint management for the MesoflixLabs platform.
 * Automatically switches between local development and production Render environment.
 */

const IS_PRODUCTION = import.meta.env.PROD || window.location.hostname !== 'localhost';

// The exact Render Backend URL provided by the user
export const RENDER_BACKEND_URL = 'https://mesoflixcrypto-2.onrender.com';

// Local Development Fallback
export const LOCAL_BACKEND_URL = 'http://localhost:3001';

/**
 * Get the standardized API Base URL
 * Ensures all frontend fetches target the correct environment.
 */
export const getApiUrl = (path = '') => {
  const baseUrl = IS_PRODUCTION ? RENDER_BACKEND_URL : LOCAL_BACKEND_URL;
  
  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return the full qualified URL
  return `${baseUrl}${normalizedPath}`;
};

export default {
  baseUrl: IS_PRODUCTION ? RENDER_BACKEND_URL : LOCAL_BACKEND_URL,
  getApiUrl
};
