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
export async function bybitRequest(method, endpoint, params = {}, config = {}) {
  const { apiKey, apiSecret, isTestnet, isDemo, brokerId } = config;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Bybit API Key and Secret are required for this request.');
  }

  // MANDATORY: Bybit Broker ID for Rebate Tracking
  const FINAL_BROKER_ID = brokerId || 'Ef001038';

  // Base URL selection based on environment
  const baseUrl = isDemo
    ? 'https://api-demo.bybit.com'
    : isTestnet 
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
    'Referer': FINAL_BROKER_ID, // Mandatory Header for Bybit Broker Program
    'X-Referer': FINAL_BROKER_ID  // Backup redundancy for some endpoints
  };

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? data : undefined
    });

    const result = await response.json();
    
    // Internal Logging for Broker Verification
    console.log(`[BYBIT_API_LOG] ${new Date().toISOString()} | ${method} ${endpoint} | Status: ${result.retCode} | Msg: ${result.retMsg} | Broker: ${FINAL_BROKER_ID} | Latency: ${Date.now() - startTime}ms`);
    
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
