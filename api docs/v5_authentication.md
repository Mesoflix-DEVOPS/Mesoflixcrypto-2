# Bybit V5 API Authentication

## Signature Generation
Bybit V5 API requires each request (except public ones) to be signed with an HMAC_SHA256 signature generated using your API Key and Secret.

### Required Headers
- **X-BAPI-API-KEY**: Your API Key.
- **X-BAPI-TIMESTAMP**: Current timestamp in milliseconds.
- **X-BAPI-SIGN**: The generated signature (lowercase hex string).
- **X-BAPI-RECV-WINDOW**: Optional (default is 5000ms).
- **Referer**: `Ef001038` (Broker integration requirement).

### Signing Logic (GET)
Combine parameters into a query string and join with timestamp, API Key, and recv_window.
`timestamp + api_key + recv_window + queryString`

### Signing Logic (POST)
Combine the JSON body string with timestamp, API Key, and recv_window.
`timestamp + api_key + recv_window + data`

### Example Signature Code (Node.js)
```javascript
const crypto = require('crypto');
const signature = crypto.createHmac('sha256', apiSecret)
  .update(timestamp + apiKey + recvWindow + data)
  .digest('hex');
```
