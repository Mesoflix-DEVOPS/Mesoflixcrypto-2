# Bybit V5 API Introduction

## Overview
The V5 API brings uniformity and efficiency to Bybit's product lines, unifying Spot, Derivatives, and Options in one set of specifications.

### Key Upgrades
- **Product Lines Alignment**: Unifies various trading products into one interface. Use `category=spot/linear/inverse/option` to distinguish.
- **Enhanced Capital Efficiency**: Unified Trading Account (UTA) support for cross-asset collateral and shared margin.
- **Unified Account Borrowing**: Pledge multiple assets as collateral.
- **API Interface Naming Standard**: /{host}/{version}/{product}/{module} (e.g., `api.bybit.com/v5/market/recent-trade`).

### Broker Integration
Brokers must include the `Referer` header in their API requests for order tracking and rebate calculation.
- **Broker ID**: Ef001038
- **Header**: `Referer: Ef001038`
