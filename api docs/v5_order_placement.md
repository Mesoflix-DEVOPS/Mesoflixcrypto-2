# Bybit V5 API Order Placement

## Create Order (POST /v5/order/create)
This endpoint is used for placing orders in Spot, Linear, Inverse, and Options categories.

### Required Header
- **Referer**: Ef001038

### Common Parameters
- **category**: `spot`, `linear`, `inverse`, `option`.
- **symbol**: e.g., `BTCUSDT`.
- **side**: `Buy` or `Sell`.
- **orderType**: `Market` or `Limit`.
- **qty**: Quantity.
- **price**: Price (only if `orderType` is `Limit`).
- **timeInForce**: `GTC`, `IOC`, `FOK`, `PostOnly`.
- **orderLinkId**: Your unique client-side identifier (must ensure uniqueness within 24 hours).

### Example Payload (Spot Buy)
```json
{
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
}
```

### Response
Returns `orderId` and `orderLinkId` upon success.
If tracking for rebates fails, the `Referer` header may not have been correctly included or verified by Bybit.

### Broker Verification
Notify Bybit broker program after sending the first trade with `Referer: Ef001038` to verify API tracking.
