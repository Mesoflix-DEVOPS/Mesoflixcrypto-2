# Bybit Broker Integration Setup (Render & Database)

## 1. Render Deployment
To ensure the Bybit integration works in production on Render, please add the following Environment Variables in your Render Dashboard:

- `BYBIT_API_KEY`: Your Bybit API Key (Testnet/Mainnet).
- `BYBIT_API_SECRET`: Your Bybit API Secret.
- `BYBIT_TESTNET`: Set to `true` for Testnet, `false` for Mainnet.
- `BYBIT_BROKER_ID`: `Ef001038`.

## 2. Test Order Execution
I've added a test endpoint to the server to verify the broker tracking. You can trigger a test trade by sending a POST request to:
`https://your-render-app-url/api/bybit/test-order`

**Sample Body:**
```json
{
  "symbol": "BTCUSDT",
  "side": "Buy",
  "qty": "0.1",
  "category": "spot"
}
```

## 3. Database Integration
The system is now ready to be connected to Supabase for storing individual user API keys if you decide to allow users to trade with their own accounts. I've updated `server/index.js` with the foundational routes for balance and orders.

## 4. Next Steps
Once you make the first trade on Testnet with a small amount, please notify Bybit support as they requested so they can verify the `Referer` header tracking.
