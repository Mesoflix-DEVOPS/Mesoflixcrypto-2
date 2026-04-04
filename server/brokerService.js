import { bybitRequest } from './bybitService.js';

/**
 * Create a new Bybit Sub-Account (Sub UID) using the Master Account credentials
 * @param {string} username - Sub-account username (6-16 chars, numbers & letters)
 * @param {object} masterConfig - { apiKey, apiSecret, isTestnet }
 * @returns {Promise<object>}
 */
export async function createClientSubAccount(username, masterConfig) {
  const params = {
    username,
    memberType: 1, // 1: normal subaccount (Standard UTA)
    switch: 1,      // Enable quick login
    note: 'MesoflixBrokerManaged'
  };

  return await bybitRequest('POST', '/v5/user/create-sub-member', params, masterConfig);
}

/**
 * Generate a new API Key for a specific Sub-Account (Managed by Master)
 * @param {string} subuid - The UID of the child account
 * @param {object} masterConfig - { apiKey, apiSecret, isTestnet }
 * @returns {Promise<object>}
 */
export async function createClientApiKey(subuid, masterConfig) {
  const params = {
    subuid,
    note: 'MesoflixTradingKey',
    readOnly: 0, // 0: read/write
    permissions: {
      ContractTrade: ['Order', 'Position'],
      Spot: ['SpotTrade'],
      Wallet: ['AccountTransfer'],
      Exchange: ['ExchangeOrder']
    },
    // ips: ['*'] // Optional: bind to Render server IP for security (+90 days validity)
  };

  return await bybitRequest('POST', '/v5/user/create-sub-api', params, masterConfig);
}

/**
 * Get deposit address for a specific sub-account and coin
 * @param {string} subuid 
 * @param {string} coin (e.g. 'USDT')
 * @param {object} masterConfig 
 * @returns {Promise<object>}
 */
export async function getClientDepositAddress(subuid, coin, masterConfig) {
  const params = {
    subuid,
    coin,
    chainType: 'TRC20' // Default to TRC20 for lower fees, can be dynamic later
  };

  return await bybitRequest('GET', '/v5/asset/deposit/query-sub-member-address', params, masterConfig);
}

export default {
  createClientSubAccount,
  createClientApiKey,
  getClientDepositAddress
};
