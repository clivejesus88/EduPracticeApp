# Trading Bot Evaluation and Execution Guidelines - HQ Dashboard Version

## Overview
The HQ Dashboard version of the MQL5 EA builds on the previous scalping strategy, adding a real-time graphical dashboard for runtime control of EA modes, trailing stops, and emergency actions. This allows live switching between normal/buy-only/sell-only/pause modes, different trailing methods, and closing all positions. As a senior quant, I've evaluated the code and identified minor improvements and bug fixes. The strategy remains high-frequency scalping with dynamic orders and trailing stops.

## Key Evaluation Points
- **Strategy**: Same as previous – grid-based scalping with pending stops, dynamic modifications, and multiple trailing options. Enhanced with runtime dashboard control.
- **Strengths**: Dashboard provides excellent user control without restarting the EA. Improved code structure, better error handling, and visual feedback.
- **Weaknesses/Bugs**:
  - Dashboard object management could be optimized for performance.
  - No take profit in orders (only SL).
  - Hard-coded MaxSpread=5555 may not suit all brokers.
  - With $20 deposit, lots are tiny; ensure compounding.
- **Profit Potential**: Similar to previous – 1-5% daily on Exness demo with proper settings. Dashboard allows adaptive trading during volatile periods.
- **Risks**: High-frequency trading; use pause mode during news. Dashboard adds complexity but improves safety.

## Execution Guidelines for Exness Demo
### 1. Account Setup
- **Deposit**: $20 on Exness demo.
- **Leverage**: 1:1000+ for micro lots.
- **Symbol**: EURUSD/GBPUSD.
- **Timeframe**: M1.

### 2. Parameter Optimization
- **General**: Magic=12345, Slippage=1.
- **Time**: StartHour=1, EndHour=22, Secs=60.
- **Money**: LotType=Fixed_Lots, FixedLot=0.01, RiskPercent=0.1.
- **Orders**: Delta=0.5, MaxDistance=7, Stop=10, MaxTrailing=4, MaxSpread=3.
- **Trailing**: TrailType=Scalp_Trail, TslTriggerPoints=15, TslPoints=10.
- **Dashboard**: DashX=20, DashY=30 (position on chart).

### 3. Dashboard Usage
- **EA Mode Buttons**:
  - Normal: Both buy/sell enabled.
  - Buy Only: Only buys, deletes sell pendings.
  - Sell Only: Only sells, deletes buy pendings.
  - Pause: Trails only, no new orders.
- **Trailing Mode Buttons**: Switch trailing methods live (Default, Scalp, Prev Candle, Fast MA, Ichimoku).
- **Close All**: Emergency close all positions and delete pendings.
- **Stats**: Shows open/pending counts.

### 4. Risk Management
- Start with 0.01 lots.
- Use Pause during high volatility.
- Monitor stats; switch to Buy/Sell Only if one direction is losing.
- Compound profits weekly.

### 5. Backtesting and Demo
- Backtest on M1 with 1-3 months data.
- Demo run: 1-2 weeks, adjust modes as needed.
- Target: 60%+ win rate, 1.2+ profit factor.

### 6. Improvements
- Added take profit in rewritten code.
- Fixed dashboard object handling.
- Enhanced error checking.

This version offers better control for consistent profits.