import crypto from 'crypto';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

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

  const proxyUrl = process.env.BYBIT_PROXY_URL;
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  if (proxyUrl) {
    console.log('[BYBIT_PROXY] Routing request through static IP proxy');
  }

  try {
    const startTime = Date.now();
    const fetchOptions = {
      method,
      headers,
      body: method === 'POST' ? data : undefined
    };

    if (agent) {
      fetchOptions.agent = agent;
    }

    const response = await fetch(url, fetchOptions);
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
 * Public Market Data Request (No signature required)
 */
export async function getTickers(params = { category: 'linear' }) {
  const baseUrl = 'https://api.bybit.com';
  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}/v5/market/tickers?${queryString}`;
  
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error('[BYBIT_PUBLIC_ERROR]', err);
    return { retCode: -1, retMsg: err.message };
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
 * Get active positions (Stateless)
 * @param {object} queryParams { category, symbol }
 * @param {object} config 
 * @returns {Promise<object>}
 */
export async function getPositions(queryParams = { category: 'linear' }, config) {
  return await bybitRequest('GET', '/v5/position/list', queryParams, config);
}

/**
 * Get closed PnL history
 * @param {object} queryParams { category, symbol, limit }
 * @param {object} config 
 * @returns {Promise<object>}
 */
export async function getClosedPnL(queryParams = { category: 'linear', limit: 50 }, config) {
  return await bybitRequest('GET', '/v5/position/closed-pnl', queryParams, config);
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
  getWalletBalance,
  getPositions,
  getClosedPnL,
  getTickers
};
