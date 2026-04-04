import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate HMAC_SHA256 signature for Bybit V5 API
 * @param {string} timestamp 
 * @param {string} apiKey 
 * @param {string} apiSecret 
 * @param {string} recvWindow 
 * @param {string} data (JSON string for POST, query string for GET)
 * @returns {string} 
 */
function generateSignature(timestamp, apiKey, apiSecret, recvWindow, data) {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(timestamp + apiKey + recvWindow + data)
    .digest('hex');
}

/**
 * Make a signed request to Bybit V5 API (Stateless)
 * @param {string} method ('GET' or 'POST')
 * @param {string} endpoint (e.g., '/v5/order/create')
 * @param {object} params (Query params for GET, body for POST)
 * @param {object} config { apiKey, apiSecret, isTestnet, brokerId }
 * @returns {Promise<object>}
 */
async function bybitRequest(method, endpoint, params = {}, config = {}) {
  const { apiKey, apiSecret, isTestnet, brokerId } = config;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Bybit API Key and Secret are required for this request.');
  }

  const baseUrl = isTestnet 
    ? 'https://api-testnet.bybit.com' 
    : 'https://api.bybit.com';
    
  const timestamp = Date.now().toString();
  const recvWindow = '5000';
  let data = '';
  let url = baseUrl + endpoint;

  if (method === 'GET') {
    const queryString = new URLSearchParams(params).toString();
    data = queryString;
    if (queryString) {
      url += '?' + queryString;
    }
  } else {
    data = JSON.stringify(params);
  }

  const sign = generateSignature(timestamp, apiKey, apiSecret, recvWindow, data);

  const headers = {
    'X-BAPI-API-KEY': apiKey,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-SIGN': sign,
    'X-BAPI-RECV-WINDOW': recvWindow,
    'Content-Type': 'application/json',
    'Referer': brokerId || 'Ef001038' // Broker ID tracking
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? data : undefined
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Bybit API Request Failed:', error);
    throw error;
  }
}

/**
 * Create a new order (Stateless)
 * @param {object} orderParams 
 * @param {object} config 
 * @returns {Promise<object>}
 */
export async function createOrder(orderParams, config) {
  return await bybitRequest('POST', '/v5/order/create', orderParams, config);
}

/**
 * Get wallet balance (Stateless)
 * @param {object} queryParams { accountType }
 * @param {object} config 
 * @returns {Promise<object>}
 */
export async function getWalletBalance(queryParams = { accountType: 'UNIFIED' }, config) {
  return await bybitRequest('GET', '/v5/account/wallet-balance', queryParams, config);
}

export default {
  createOrder,
  getWalletBalance
};
