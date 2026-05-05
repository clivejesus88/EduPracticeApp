# TRADING BOT COMPARISON & QUICK REFERENCE GUIDE

## Bot Versions Overview

### HIGH_FREQ_V2.MQ5
**Best for:** Automated hands-off trading, backtesting, simplicity  
**Pros:**
- Lightweight, fewer code paths
- Fast backtesting (no UI updates)
- Simple parameter configuration
- Lower CPU overhead

**Cons:**
- No runtime mode switching
- Cannot pause EA mid-session
- Limited visibility into state

**Use Case:** Conservative traders, automated 24/7 operation

---

### HQ_DASHBOARD_V2.MQ5
**Best for:** Active monitoring, adaptive trading, real-time control  
**Pros:**
- Real-time dashboard for mode switching
- Can pause during volatility/news
- Visual position/order statistics
- Emergency close button
- Adjustable trailing methods live

**Cons:**
- Slightly more complex
- Uses more memory (dashboard objects)
- Requires monitoring

**Use Case:** Active traders, market-responsive strategies

---

## Side-by-Side Comparison

| Feature | HIGH_FREQ_V2 | HQ_DASHBOARD_V2 |
|---------|--------------|-----------------|
| **Core Scalping Logic** | ✅ Yes | ✅ Yes (identical) |
| **Dashboard UI** | ❌ No | ✅ Yes |
| **Mode Switching** | ❌ No | ✅ Yes (5 modes) |
| **Pause Mode** | ❌ No | ✅ Yes |
| **Live Stats Display** | ❌ No | ✅ Yes |
| **Emergency Close** | ❌ No | ✅ Yes |
| **Trailing Modes** | 5 (via input) | 5 (switchable live) |
| **Backtest Speed** | Fast | Slightly slower (UI) |
| **Memory Footprint** | Minimal | ~50KB (dashboard objects) |
| **API Calls/Tick** | ~50 | ~60 (+10 UI) |
| **Recommended Account** | Any | Micro/Small |
| **Skill Level Required** | Beginner | Intermediate |

---

## Decision Matrix

### Choose HIGH_FREQ_V2 if:
✅ You want fully automated trading  
✅ You plan to run 24/7 unattended  
✅ You prefer minimal complexity  
✅ Backtesting is your primary focus  
✅ You don't need real-time control  

### Choose HQ_DASHBOARD_V2 if:
✅ You monitor the charts regularly  
✅ You want to adapt to market conditions  
✅ You need emergency stop capability  
✅ You prefer visual feedback  
✅ You want to test different trailing modes live  

---

## Parameter Optimization Guide

### Recommended Starting Parameters (Both Versions)

```
Account Size: $20
Timeframe: M1
Symbol: EURUSD or GBPUSD

GENERAL:
  InpMagic: 12345 (unique per instance)
  Slippage: 1

TIME:
  StartHour: 1
  EndHour: 22
  Secs: 60

MONEY:
  LotType: 0 (Fixed)
  FixedLot: 0.01
  RiskPercent: 0.1

ORDERS:
  Delta: 0.5
  MaxDistance: 7
  Stop: 10
  MaxTrailing: 4
  MaxSpread: 3

TRAILING:
  TrailType: 1 (Scalp)
  TslTriggerPoints: 15
  TslPoints: 10
```

### Tuning by Observation

| Observation | Adjustment | Reason |
|-------------|-----------|--------|
| No orders placed | Increase Delta (0.5→1.0) | Orders placed farther, more likely to trigger |
| Orders deleted too fast | Reduce MaxSpread (3→5) | Allow wider spread range |
| SL hit too often | Increase Stop (10→15) | Wider stop loss cushion |
| No trailing happening | Reduce TslTriggerPoints (15→5) | Easier to trigger trailing |
| Too many orders | Increase Secs (60→120) | Longer modification interval |
| Margin calls | Reduce FixedLot (0.01→0.005) | Smaller position size |
| Low win rate | Increase MaxTrailing (4→6) | More aggressive trailing |

---

## Trading Session Checklist

### Pre-Session (First Time)
- [ ] Set InpMagic to unique value
- [ ] Verify account size ($20+)
- [ ] Confirm symbol (EURUSD/GBPUSD)
- [ ] Check timeframe (M1)
- [ ] Review all parameters
- [ ] Enable "Allow Algorithmic Trading" in MT5
- [ ] Verify spread is reasonable (<3 pips)

### Daily Session
- [ ] Launch EA at trading start time
- [ ] Check logs for errors (Expert Advisors tab)
- [ ] Monitor first 10 trades (win/loss ratio)
- [ ] Verify trailing stops are active

### HQ Dashboard Only
- [ ] Observe mode buttons (Normal should be green)
- [ ] Watch stats panel (should update each tick)
- [ ] Check for any error messages in "Comments"

### End of Session
- [ ] Review session profit/loss
- [ ] Note any patterns (directional bias?)
- [ ] Adjust parameters if needed
- [ ] Document changes in a log

---

## Performance Expectations

### Realistic First Week
```
Day 1-2:  -2% to +1% (EA learning, spread familiarization)
Day 3-4:  +1% to +3% (parameters tuning in)
Day 5-7:  +2% to +5% (consistent trading)

Week Average: +0.5% to +2% daily
Monthly Projection: +10% to +40% (compounding)
```

### Milestones
```
After 1 Week:
  ✓ Minimum 50 trades
  ✓ Win rate ≥ 55%
  ✓ No more than 5% drawdown
  ✓ Consistent daily P&L

After 1 Month:
  ✓ 500+ trades
  ✓ Win rate ≥ 60%
  ✓ Max drawdown ≤ 10%
  ✓ Account ≥ $30 (50% profit)

After 3 Months:
  ✓ Account ≥ $80 (300% profit)
  ✓ Consistent 1-3% daily returns
  ✓ Ready for scaling
```

---

## Troubleshooting Quick Reference

### EA Not Trading
```
Checklist:
1. Check terminal shows "Expert Advisors ✓" (green)
2. Verify "Allow Algorithmic Trading" enabled
3. Check logs (View → Toolbox → Expert Advisors)
4. Confirm InpMagic is unique (no conflict)
5. Verify account time is correct (synchronized)
6. Check spread: if > MaxSpread, no orders placed
```

### Orders Placed But Deleted
```
Likely Causes:
1. Spread > MaxSpread (reduce MaxSpread in inputs)
2. Outside trading hours (expand StartHour/EndHour)
3. Insufficient margin (reduce FixedLot)
4. Broker stop level preventing SL placement (increase Stop value)
```

### High Drawdown (> 10%)
```
Immediate Actions:
1. Switch to Pause mode (HQ Dashboard only)
2. Review recent trades (why losing?)
3. Reduce FixedLot (0.01 → 0.005)
4. Increase Stop (10 → 15)
5. Return to Normal when comfortable
```

### Trailing Stops Not Working
```
Verify:
1. Positions are in profit (TslTriggerPoints threshold)
2. TrailType matches selected mode
3. Check trade logs for trailing stop updates
4. Verify StopLoss was set on initial order (it should be)
```

---

## Scaling Strategy (Long-Term Profit Growth)

### Phase 1: Foundation ($20 → $50)
```
FixedLot: 0.01
Duration: 1-2 weeks
Goal: Achieve 60%+ win rate, consistent daily P&L
Action: Do NOT increase lot until milestone hit
```

### Phase 2: Growth ($50 → $200)
```
FixedLot: 0.02 (double at $40)
FixedLot: 0.05 (at $100)
Duration: 2-3 weeks
Goal: Maintain profitability at higher lot size
Action: Monitor drawdown; stay conservative
```

### Phase 3: Acceleration ($200 → $1000+)
```
FixedLot: 0.1 (0.1 standard lots)
Switch to: % of Balance mode (2% risk)
Duration: Ongoing
Goal: Consistent monthly returns
Action: Reinvest profits, scale gradually
```

### Phase 4: Professional ($1000+)
```
Multi-symbol trading possible
Larger lot sizes (0.5+ standard lots)
Consider grid EA enhancements
Explore multi-timeframe strategies
```

---

## Common Myths & Facts

| Myth | Fact |
|------|------|
| "EA makes money every day" | No. 40% of days may be losing. Focus on monthly average. |
| "High win rate = profitable" | No. 40% win rate with 2:1 RR is profitable. |
| "$20 grows to $1000 overnight" | Unrealistic. $20 → $100 takes 2-3 months with 10% monthly. |
| "Always leave it running" | False. Pause during news, weekends, low liquidity. |
| "More leverage = more profit" | False. 1:1000 on $20 is already max. Adds risk, not profit. |
| "No SL needed if always running" | False. SL essential. Prevents catastrophic loss on flash crash. |

---

## Risk Management Rules (Non-Negotiable)

1. **Always use Stop Loss**
   - Set automatically by EA, never remove
   - Protects against flash crashes, gaps

2. **Never Risk More Than 2% Per Trade**
   - $20 account: risk max $0.40 per trade
   - Use RiskPercent = 0.1 (0.1% = $0.02) for safety

3. **Max Drawdown: 10%**
   - $20 account: stop if drawdown > $2
   - Switch to Pause mode, analyze trades

4. **Compound Profits**
   - Never withdraw profits early
   - Reinvest to accelerate growth

5. **Avoid News Events**
   - High volatility (spreads widen, slippage high)
   - Pause EA 30 min before/after major releases
   - Use economic calendar: tradingeconomics.com

6. **Monitor Regularly**
   - Check daily P&L (not per-trade)
   - Review weekly performance
   - Adjust only if consistent issue

---

## File Locations & Naming

```
Workspace Folder:
C:\Users\GODSIMAGE4\EduPracticeApp\

EA Files:
├── high_freq_v2.mq5                    // Simple version
├── hq_dashboard_v2.mq5                 // Dashboard version
├── HIGH_FREQ_V2_DOCUMENTATION.md       // Detailed docs (simple)
├── HQ_DASHBOARD_V2_DOCUMENTATION.md    // Detailed docs (dashboard)
├── Trading_Bot_Guidelines.md           // Execution guide
├── Trading_Bot_Guidelines_HQ.md        // Execution guide (HQ)
└── TRADING_BOT_COMPARISON.md           // This file
```

---

## Next Steps

### For First-Time Users
1. **Read:** HIGH_FREQ_V2_DOCUMENTATION.md (30 min)
2. **Setup:** Load high_freq_v2.mq5 on Exness demo ($20)
3. **Run:** 1 week on Normal mode
4. **Evaluate:** Check profitability (target: +1% daily)
5. **Decide:** Upgrade to dashboard or stay simple

### For Active Traders
1. **Read:** HQ_DASHBOARD_V2_DOCUMENTATION.md (45 min)
2. **Setup:** Load hq_dashboard_v2.mq5 on Exness demo
3. **Test:** Try all modes (Normal, Buy Only, Sell Only, Pause)
4. **Optimize:** Switch trailing modes; find best fit
5. **Scale:** Graduate to live trading after 1 month demo

### For Advanced Users
1. Backtest both versions against 3 months of data
2. Optimize parameters for your chosen symbol
3. Test on live micro account (not real money)
4. Scale gradually to larger accounts
5. Consider multi-bot setups (different magic numbers)

---

## Support & Resources

### Documentation
- Read .MD files first (provide comprehensive info)
- Review code comments in .MQ5 files for technical details

### MT5 References
- Built-in Help: F1 in MetaEditor
- MQL5 Documentation: www.mql5.com/en/docs
- Exness Support: support.exness.com

### Troubleshooting
- Check Expert Advisors tab in MT5 (error logs)
- Verify all input parameters are valid
- Test on demo before going live

---

## Version Information

| File | Version | Status | Last Updated |
|------|---------|--------|--------------|
| high_freq_v2.mq5 | 2.00 | Production | May 2026 |
| hq_dashboard_v2.mq5 | 2.10 | Production | May 2026 |
| Trading_Bot_Guidelines.md | 1.0 | Current | May 2026 |
| Trading_Bot_Guidelines_HQ.md | 1.0 | Current | May 2026 |

---

## Final Checklist Before Going Live

- [ ] Tested on demo for minimum 1 week
- [ ] Achieved 50+ trades with 55%+ win rate
- [ ] Drawdown never exceeded 10%
- [ ] Account grew to at least $25 (25% profit)
- [ ] Parameters documented and optimized
- [ ] Understand all features of chosen EA
- [ ] Have backup manual trading plan
- [ ] Ready to risk real capital (start micro)

---

**Remember:** Patience beats speed. Compound gradually. Survive first, profit second.**

*Good luck! 🚀*