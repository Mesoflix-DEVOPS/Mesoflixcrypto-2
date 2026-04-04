import crypto from 'crypto';

// Testing current signature generation logic for Bybit V5
function generateSignature(timestamp, apiKey, recvWindow, data, apiSecret) {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(timestamp + apiKey + recvWindow + data)
    .digest('hex');
}

const testTimestamp = '1672211928338';
const testApiKey = 'XXXXX';
const testApiSecret = 'XXXXX';
const testRecvWindow = '5000';
const testData = JSON.stringify({
    "category": "spot",
    "symbol": "BTCUSDT",
    "side": "Buy",
    "orderType": "Limit",
    "qty": "0.1",
    "price": "15600",
    "timeInForce": "PostOnly",
    "orderLinkId": "spot-test-postonly",
    "isLeverage": 0,
    "orderFilter": "Order"
});

console.log('Testing Signature Generation...');
const signature = generateSignature(testTimestamp, testApiKey, testRecvWindow, testData, testApiSecret);
console.log('Generated Signature:', signature);
console.log('Test Passed if signature is a lowercase hex string.');
