# HQ_DASHBOARD_V2.MQ5 - Complete Technical Documentation

## Overview
**Version:** 2.10  
**Type:** High-Frequency Scalping EA with Interactive Dashboard  
**Target:** Exness Demo/Live (Micro Accounts)  
**Strategy:** Grid scalping + dynamic order management + runtime control  
**Minimum Capital:** $20 USD  
**Timeframe:** M1 (1-minute)  
**Special Feature:** Real-time dashboard for mode switching and emergency actions

---

## Key Enhancements Over HIGH_FREQ_V2

### 1. **Interactive Dashboard**
- Real-time EA mode switching (Normal → Buy Only → Sell Only → Pause)
- Live trailing stop method selection (5 modes)
- Position/order statistics display
- Emergency close-all button

### 2. **Runtime Mode Control**
```
EA Modes:
┌─────────────────────────────────────────────┐
│ ▶ Normal       | ▲ Buy Only                │
│ ▼ Sell Only    | ⏸ Pause                  │
└─────────────────────────────────────────────┘
```

**Mode Behaviors:**
- **Normal (0):** Both buys and sells enabled
- **Buy Only (1):** Only buy orders; deletes sell pendings
- **Sell Only (2):** Only sell orders; deletes buy pendings
- **Pause (3):** No new orders; trailing stops only (protect profits)

### 3. **Trailing Stop Mode Switching**
```
Trailing Modes (switchable live):
┌──────────────┬──────────────┐
│ Default      │ Scalp        │
│ Prev Candle  │ Fast MA      │
│ Ichimoku Tenkan (full width)│
└──────────────┴──────────────┘
```

### 4. **Live Statistics Panel**
Displays in real-time:
```
Buy:  2 open  | 0 pending
Sell: 1 open  | 1 pending
```

---

## Bug Fixes Applied in V2.10

### 1. **Improved Dashboard Object Management**
- All dashboard objects properly created with correct properties
- Correct anchor and distance settings for all UI elements
- Proper color scheme for active/inactive states

### 2. **Fixed Trade Enable Flags**
- `g_BuysEnabled` and `g_SellsEnabled` properly control order placement
- Dashboard buttons sync with internal state
- DeletePendingByType() called when mode changes

### 3. **Corrected OnChartEvent Handling**
- All button clicks properly routed through `OnChartEvent`
- State updates synchronized to dashboard immediately
- Chart redraws after each action

### 4. **Added Divide-by-Zero Guards**
- Safe calculation in `GetLotSize()`
- Safe ratio in `CalculateTrailingStop()`

### 5. **Proper Handle Management**
- Indicator handles (MA, Ichimoku) properly released on mode change
- No memory leaks from indicator handles
- SetTrailMode() creates/destroys handles dynamically

### 6. **ObjectSetString() Calls Fixed**
- Correct parameter order: `ObjectSetString(chart, object_name, property, value)`
- RefreshDashboard() properly updates stats labels

---

## Input Groups & Parameters

### GENERAL SETTINGS
```
InpMagic = 12345          // Unique EA identifier
Slippage = 1              // Max acceptable slippage (points)
```

### TIME SETTINGS
```
StartHour = 1             // Trading starts at 01:00 GMT
EndHour = 22              // Trading stops at 22:00 GMT
Secs = 60                 // Modify pending orders every 60 seconds
```

### MONEY MANAGEMENT
```
LotType = Fixed_Lots      // Lot sizing method
FixedLot = 0.01           // Lot size for Fixed mode ($20: 0.01 micro lot)
RiskPercent = 0.1         // Risk % for % modes (0.1% recommended)
```

### ORDER SETTINGS (Points)
```
Delta = 0.5               // Base pending order distance
MaxDistance = 7           // Max order placement distance
Stop = 10                 // Stop loss size (points)
MaxTrailing = 4           // Max trailing stop multiplier
MaxSpread = 3             // Max acceptable spread
```

### TRAILING STOP
```
TrailType = Scalp_Trail   // Default trailing method
TslTriggerPoints = 15     // Profit threshold to activate trailing
TslPoints = 10            // Trailing stop distance
PrvCandleN = 1            // Previous candle lookback
FMAperiod = 5             // MA period for FastMA mode
MA_Mode = MODE_EMA        // EMA calculation
MA_AppPrice = PRICE_MEDIAN// Applied to median
```

### DASHBOARD
```
DashX = 20                // Dashboard X position (pixels from left)
DashY = 30                // Dashboard Y position (pixels from top)
```

---

## Dashboard Architecture

### Visual Layout
```
┌──────────────────────────────────────────┐
│  ⚡ CEEJAY HF HQ v2.10                   │ Title Bar (24px)
├──────────────────────────────────────────┤
│ EA MODE                                  │ Header
│ ┌────────────────┬────────────────────┐ │
│ │ ▶ Normal       │ ▲ Buy Only         │ │ Mode Row 1 (22px)
│ ├────────────────┼────────────────────┤ │
│ │ ▼ Sell Only    │ ⏸ Pause            │ │ Mode Row 2 (22px)
│ └────────────────┴────────────────────┘ │
│                                          │
│ TRAILING MODE                            │ Header
│ ┌────────────────┬────────────────────┐ │
│ │ Default        │ Scalp              │ │ Trail Row 1 (22px)
│ ├────────────────┼────────────────────┤ │
│ │ Prev Candle    │ Fast MA            │ │ Trail Row 2 (22px)
│ ├────────────────────────────────────┤ │
│ │ Ichimoku Tenkan                    │ │ Trail Row 3 (22px, full width)
│ └────────────────────────────────────┘ │
│                                          │
│ LIVE STATS                               │ Header
│ Buy:  2 open  | 0 pending              │ Stats Line 1
│ Sell: 1 open  | 1 pending              │ Stats Line 2
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ ✖ CLOSE ALL & DELETE PENDING         ││ Emergency Button
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

**Dimensions:**
- Panel Width: 220px
- Panel Height: 310px
- Button Width: 96px (2 per row)
- Button Height: 22px
- Row Height: 26px

### Color Scheme
```
CLR_PANEL = C'25,25,35'         // Dark background
CLR_HDR = C'40,40,60'           // Header background
CLR_ACTIVE = C'0,180,100'       // Green (active)
CLR_INACTIVE = C'60,60,80'      // Gray (inactive)
CLR_PAUSE = C'200,80,0'         // Orange (paused)
CLR_DANGER = C'180,30,30'       // Red (emergency)
CLR_TEXT_ON = clrWhite          // White text on active
CLR_TEXT_OFF = C'160,160,180'  // Gray text on inactive
CLR_TITLE = C'120,200,255'      // Cyan title
```

---

## Core Functions

### OnInit()
- Initializes all dashboard objects (BuildDashboard)
- Creates indicator handles if needed
- Sets up spread history array
- Syncs button states to initial mode

### OnChartEvent()
Handles dashboard button clicks:

```cpp
if (sparam == BTN_MODE_NORMAL) {
    g_EAMode = 0;
    g_BuysEnabled = true;
    g_SellsEnabled = true;
}
// ... other modes ...

if (sparam == BTN_TRAIL_SCALP) {
    SetTrailMode(1);  // Switch to Scalp trailing
}
// ... other trail modes ...

if (sparam == BTN_CLOSE_ALL) {
    CloseAllPositions();
    DeleteAllPending();
}
```

### OnTick()
Same core logic as HIGH_FREQ_V2, but:
1. Respects `g_BuysEnabled` and `g_SellsEnabled` flags
2. Calls RefreshDashboard() at end to update stats
3. Paused mode (g_EAMode == 3) skips order placement

### Dashboard Functions

#### BuildDashboard()
- Creates all UI objects (buttons, labels, rectangles)
- Positions elements according to DashX, DashY
- Sets initial colors/states
- Called once in OnInit()

#### DestroyDashboard()
- Deletes all dashboard objects
- Called in OnDeinit()

#### RefreshDashboard(buyOpen, sellOpen, buyPend, sellPend)
- Updates stats display
- Syncs button colors to current state
- Called each tick

#### SyncModeButtons() & SyncTrailButtons()
- Sets correct button colors for active/inactive states
- Resets button depression state
- Called after mode change

#### SetTrailMode(int mode)
- Dynamically switches trailing method
- Releases old indicator handles
- Creates new handles if needed
- Safe for live switching

---

## Trading Logic with Dashboard

### Mode Logic Flow
```
OnTick():
  │
  ├─ If (g_EAMode == 3):  // Pause mode
  │  └─ TrailStop() only, then return  // No new orders
  │
  ├─ If (g_BuysEnabled && conditions):
  │  └─ Place BUY_STOP order
  │
  ├─ If (g_SellsEnabled && conditions):
  │  └─ Place SELL_STOP order
  │
  └─ TrailStop() on all positions
```

### Buy Only Mode
- Prevents sell order placement
- Deletes all pending SELL_STOP orders
- Continues trailing existing sell positions (close them out)

### Sell Only Mode
- Prevents buy order placement
- Deletes all pending BUY_STOP orders
- Continues trailing existing buy positions

### Pause Mode
- Stops all new order placement
- Deletes all pending orders
- Continues trailing open positions only
- **Use during high volatility / news / weekends**

---

## Advanced Usage

### Live Trailing Mode Switch
1. Click button (e.g., "Fast MA")
2. SetTrailMode(3) executes
3. If old mode had indicator handle → released
4. MA indicator created if not exists
5. Next tick: all positions trail using MA

**Example:** Switch from Scalp to Ichimoku:
- Existing trades immediately use Tenkan line
- No position disruption
- Smooth transition

### Emergency Close
1. Click "✖ CLOSE ALL & DELETE PENDING"
2. CloseAllPositions() closes all open trades at market
3. DeleteAllPending() removes all pending orders
4. Dashboard updates stats to 0 open, 0 pending
5. Button resets state

### Multi-Session Monitoring
- Keep chart open during multiple trading sessions
- Switch modes based on market conditions
- Dashboard visible on all timeframes

---

## Performance Optimization

### Dashboard Rendering
- Objects cached; only colors updated each tick (not recreated)
- Chart redraw only on mode change (not every tick)
- String formatting minimal

### Memory Management
- Indicator handles released when switching modes
- SpreadHistoryArray limited to 30 elements
- Local variables scoped to functions

### CPU Efficiency
- OnTick() executes < 1ms on typical broker
- Dashboard updates asynchronous (button click event)
- No timer or sleep functions

---

## Backtesting & Demo Verification

### Backtest Setup
1. Load high_freq_v2.mq5 (simpler, faster backtest)
2. Run on M1, 3 months data
3. Optimize for Sharpe ratio > 1.5
4. Note best parameters

### Demo Testing (7 Days)
1. Load hq_dashboard_v2.mq5 with optimized params
2. Run Normal mode first 2 days
3. If profitable: Test Buy Only / Sell Only for 1 day each
4. If struggling: Switch to Pause, analyze trades
5. Days 5-7: Resume normal trading, monitor stats

### Metrics to Track
```
Per Session (24 hours):
├─ Total Trades: ≥ 50
├─ Win Rate: ≥ 60%
├─ Avg Win: > Avg Loss × 1.5
├─ Max Drawdown: < 5%
├─ Profit: ≥ $0.20 (1% on $20)
└─ Ratio Trades Buys:Sells ≈ 1:1
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard not appearing | Check DashX/DashY position; may be off-screen |
| Buttons not clickable | Enable "Allow Algorithmic Trading" in MT5 settings |
| Mode doesn't change | Check Expert Advisors log for errors |
| Stats show 0/0 always | Verify InpMagic matches order magic number |
| Orders deleted too fast | Increase MaxSpread; reduce during high volatility |
| Trailing not working | Ensure TrailType matches selected mode; check profit threshold |
| Cannot close positions | Use Pause mode, then manually close in terminal |

---

## Code Quality Checklist

✅ All dashboard objects properly created  
✅ OnChartEvent() handles all buttons  
✅ RefreshDashboard() updates stats correctly  
✅ SetTrailMode() safely manages indicator handles  
✅ Trade enable flags respected in OnTick()  
✅ Divide-by-zero guards in place  
✅ ORDER_TIME_GTC used for all orders  
✅ Lot size calculation safe  
✅ Spread filtering active  
✅ Margin checks in place  

---

## Version History

**V2.10 (Current)**
- Fixed dashboard object management
- Improved trade enable flag logic
- Added divide-by-zero guards
- Corrected ObjectSetString() calls
- Enhanced RefreshDashboard()

**V2.00**
- Initial dashboard release
- Mode switching functionality
- Stats panel implementation

---

## Exness Demo Execution Plan

### Day 1: Setup & Calibration
1. Load EA on EURUSD M1
2. Set FixedLot = 0.01, MaxSpread = 3
3. Leave in Normal mode
4. Monitor 2-3 hours during London session

### Days 2-3: Testing Normal Mode
- Target: 50+ trades, win rate ≥ 60%
- If profitable: Continue
- If losing: Adjust Delta (0.5→0.3) or Stop (10→15)

### Days 4-5: Directional Testing
- Day 4: Buy Only mode for 1 session
- Day 5: Sell Only mode for 1 session
- Compare profitability by direction

### Days 6-7: Adaptive Trading
- Use Pause during news events
- Switch trailing modes based on volatility
- Achieve 15-25% return target

### After 1 Week
- If successful on demo: Ready for live
- If unsuccessful: Adjust parameters, retry

---

## Live Trading Preparation

### Pre-Live Checklist
- [ ] 1 week profitable demo trading
- [ ] Drawdown never exceeded 10%
- [ ] Win rate stable ≥ 55%
- [ ] Parameters documented and tested
- [ ] Understand all dashboard modes
- [ ] Have backup manual trading plan

### Initial Live Settings
```
Account Size: $20–$100 (start small)
FixedLot: 0.01 (or appropriate for size)
RiskPercent: 0.1
MaxSpread: 2–3 (live spreads usually tighter)
TrailType: Scalp_Trail (simplest, most robust)
```

### Live Monitoring
- Check EA status daily
- Review P&L (not per-trade)
- Adjust only if consistent issue
- Pause during broker maintenance

---

## Disclaimer
**This EA is for educational purposes. Forex trading involves substantial risk. Test thoroughly on demo before deploying real capital. Past performance ≠ future results. Trade at your own risk.**

---

## Author & License
**Author:** Ceejay  
**Version:** 2.10  
**Copyright:** 2026  
**License:** Use for personal/educational purposes only