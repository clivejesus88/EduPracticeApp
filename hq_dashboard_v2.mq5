#property copyright "Copyright 2026, Ceejay - HQ Dashboard Rewritten"
#property version "2.10"

#include <Trade\Trade.mqh>
CTrade trade;
CPositionInfo posinfo;
COrderInfo ordinfo;
CHistoryOrderInfo hisinfo;
CDealInfo dealinfo;

enum enumLotType { Fixed_Lots = 0, Pct_of_Balance = 1, Pct_of_Equity = 2, Pct_ofFreeMargin = 3 };
enum TSLType { Default_Trail = 0, Scalp_Trail = 1, Previous_Candle = 2, Fast_MA = 3, Tenkansen = 4 };

input group "=== GENERAL SETTINGS ===";
input int InpMagic = 12345;
input int Slippage = 1;

input group "=== TIME SETTINGS ===";
input int StartHour = 1;
input int EndHour = 22;
input int Secs = 60;

input group "=== MONEY MANAGEMENT ===";
input enumLotType LotType = Fixed_Lots;
input double FixedLot = 0.01;
input double RiskPercent = 0.1;

input group "=== ORDER SETTINGS (POINTS) ===";
input double Delta = 0.5;
input double MaxDistance = 7;
input double Stop = 10;
input double MaxTrailing = 4;
input int MaxSpread = 3;

input group "=== TRAILING STOP ===";
input TSLType TrailType = Scalp_Trail;
input int TslTriggerPoints = 15;
input int TslPoints = 10;
input int PrvCandleN = 1;
input int FMAperiod = 5;
input ENUM_MA_METHOD MA_Mode = MODE_EMA;
input ENUM_APPLIED_PRICE MA_AppPrice = PRICE_MEDIAN;

input group "=== DASHBOARD ===";
input int DashX = 20;
input int DashY = 30;

int g_EAMode = 0;
int g_TrailMode = 0;
bool g_BuysEnabled = true;
bool g_SellsEnabled = true;

int handleTrailMA = INVALID_HANDLE;
int handleIchimoku = INVALID_HANDLE;

double DeltaX = 0;
double MinOrderDistance = 0.5;
double MaxTrailingLimit = 7.5;
double OrderModificationFactor = 3;
int TickCounter = 0;
double PriceToPipRatio = 0;
double BaseTrailingStop = 0;
double TrailingStopBuffer = 0;
double TrailingStopIncrement = 0;
double TrailingStopThreshold = 0;
long AccountLeverageValue = 0;
double LotStepSize = 0;
double MaxLotSize = 0;
double MinLotSize = 0;
double MinStopDistance = 0;
double MinFreezeDistance = 0;
int BrokerStopLevel = 0;
int BrokerFreezeLevel = 0;
double CurrentSpread = 0;
double AverageSpread = 0;
int SpreadArraySize = 0;
int DefaultSpreadPeriod = 30;
double MaxAllowedSpread = 0;
double CalculatedLotSize = 0;
double CommissionPerPip = 0;
int SpreadMultiplier = 0;
double AdjustedOrderdistance = 0;
double MinOrderModification = 0;
double TrailingStopActive = 0;
double TrailingStopMax = 0;
double MaxOrderPlacementDistance = 0;
double OrderPlacementStop = 0;
double CalculatedStopLoss = 0;
int LastOrderTime = 0;
int MinOrderInterval = 0;
double CurrentBuySL = 0;
double CurrentSellSL = 0;
string OrderCommentText = "Ceejay";
int LastBuyOrderTime = 0;
int LastSellOrderTime = 0;
int OrderCheckFrequency = 2;
double SpreadHistoryArray[];

#define BTN_MODE_NORMAL "CJ_BTN_MODE0"
#define BTN_MODE_BUYONLY "CJ_BTN_MODE1"
#define BTN_MODE_SELLONLY "CJ_BTN_MODE2"
#define BTN_MODE_PAUSE "CJ_BTN_MODE3"
#define BTN_TRAIL_DEF "CJ_BTN_TR0"
#define BTN_TRAIL_SCALP "CJ_BTN_TR1"
#define BTN_TRAIL_CANDLE "CJ_BTN_TR2"
#define BTN_TRAIL_MA "CJ_BTN_TR3"
#define BTN_TRAIL_ICHI "CJ_BTN_TR4"
#define BTN_CLOSE_ALL "CJ_BTN_CLOSEALL"
#define LBL_PANEL_BG "CJ_PANEL_BG"
#define LBL_TITLE "CJ_LBL_TITLE"
#define LBL_MODE_HDR "CJ_LBL_MODE_HDR"
#define LBL_TRAIL_HDR "CJ_LBL_TRAIL_HDR"
#define LBL_STATS "CJ_LBL_STATS"

int OnInit() {
    trade.SetExpertMagicNumber(InpMagic);
    trade.SetDeviationInPoints(Slippage);
    ChartSetInteger(0, CHART_SHOW_GRID, false);

    g_TrailMode = (int)TrailType;

    if (g_TrailMode == (int)Fast_MA) handleTrailMA = iMA(_Symbol, PERIOD_CURRENT, FMAperiod, 0, MA_Mode, MA_AppPrice);
    if (g_TrailMode == (int)Tenkansen) handleIchimoku = iIchimoku(_Symbol, PERIOD_CURRENT, 9, 26, 52);

    OrderCommentText = "Ceejay";
    OrderCheckFrequency = 2;
    DefaultSpreadPeriod = 30;
    MinOrderInterval = 0;
    OrderModificationFactor = 3;
    MaxTrailingLimit = 7.5;
    MinOrderDistance = 0.5;
    SpreadMultiplier = 0;
    TrailingStopBuffer = 0;
    TrailingStopThreshold = 0;
    SpreadArraySize = DefaultSpreadPeriod;
    ArrayResize(SpreadHistoryArray, SpreadArraySize, 0);
    DeltaX = Delta;

    if (MinOrderDistance > Delta) DeltaX = MinOrderDistance + 0.1;
    if (MaxTrailing > MaxTrailingLimit) MaxTrailingLimit = MaxTrailing + 0.1;
    if (OrderModificationFactor < 1) OrderModificationFactor = 1;

    TickCounter = 0;
    PriceToPipRatio = 0;
    BaseTrailingStop = TrailingStopBuffer;
    TrailingStopIncrement = TrailingStopThreshold;
    AccountLeverageValue = AccountInfoInteger(ACCOUNT_LEVERAGE);

    LotStepSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
    MaxLotSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
    MinLotSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    MinStopDistance = 0;

    BrokerStopLevel = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
    if (BrokerStopLevel > 0) MinStopDistance = (BrokerStopLevel + 1) * _Point;
    BrokerFreezeLevel = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
    MinFreezeDistance = 0;
    if (BrokerFreezeLevel > 0) MinFreezeDistance = (BrokerFreezeLevel + 1) * _Point;

    double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    CurrentSpread = NormalizeDouble(Ask - Bid, _Digits);
    AverageSpread = CurrentSpread;
    MaxAllowedSpread = NormalizeDouble(MaxSpread * _Point, _Digits);

    TesterHideIndicators(true);

    BuildDashboard();

    return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {
    DestroyDashboard();
    if (handleTrailMA != INVALID_HANDLE) IndicatorRelease(handleTrailMA);
    if (handleIchimoku != INVALID_HANDLE) IndicatorRelease(handleIchimoku);
    Comment("");
}

void OnChartEvent(const int id, const long &lparam, const double &dparam, const string &sparam) {
    if (id != CHARTEVENT_OBJECT_CLICK) return;

    if (sparam == BTN_MODE_NORMAL) {
        g_EAMode = 0;
        g_BuysEnabled = true;
        g_SellsEnabled = true;
    }
    if (sparam == BTN_MODE_BUYONLY) {
        g_EAMode = 1;
        g_BuysEnabled = true;
        g_SellsEnabled = false;
        DeletePendingByType(ORDER_TYPE_SELL_STOP);
    }
    if (sparam == BTN_MODE_SELLONLY) {
        g_EAMode = 2;
        g_BuysEnabled = false;
        g_SellsEnabled = true;
        DeletePendingByType(ORDER_TYPE_BUY_STOP);
    }
    if (sparam == BTN_MODE_PAUSE) {
        g_EAMode = 3;
        g_BuysEnabled = false;
        g_SellsEnabled = false;
        DeleteAllPending();
    }

    if (sparam == BTN_TRAIL_DEF) SetTrailMode(0);
    if (sparam == BTN_TRAIL_SCALP) SetTrailMode(1);
    if (sparam == BTN_TRAIL_CANDLE) SetTrailMode(2);
    if (sparam == BTN_TRAIL_MA) SetTrailMode(3);
    if (sparam == BTN_TRAIL_ICHI) SetTrailMode(4);

    if (sparam == BTN_CLOSE_ALL) {
        CloseAllPositions();
        DeleteAllPending();
        ObjectSetInteger(0, BTN_CLOSE_ALL, OBJPROP_STATE, false);
    }

    RefreshDashboard(0, 0, 0, 0);
    ChartRedraw();
}

void OnTick() {
    int CurrentTime = (int)TimeCurrent();
    TickCounter++;

    int PendingBuyCount = 0, PendingSellCount = 0;
    int OpenBuyCount = 0, OpenSellCount = 0;
    int TotalBuyCount = 0, TotalSellCount = 0;
    double BuyOrdersPriceSum = 0, SellOrdersPriceSum = 0;
    double BuyOrdersLotSum = 0, SellOrdersLotSum = 0;
    double AverageBuyPrice = 0, AverageSellPrice = 0;
    double LowestBuyPrice = 99999, HighestSellPrice = 0;
    double NewOrderTakeProfit = 0;

    if (PriceToPipRatio == 0) {
        HistorySelect(0, TimeCurrent());
        for (int i = HistoryDealsTotal() - 1; i >= 0; i--) {
            ulong ticket = HistoryDealGetTicket(i);
            if (ticket == 0) continue;
            if (HistoryDealGetString(ticket, DEAL_SYMBOL) != _Symbol) continue;
            if (HistoryDealGetDouble(ticket, DEAL_PROFIT) == 0) continue;
            if ((ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;

            ulong posID = (ulong)HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
            double exitPrice = HistoryDealGetDouble(ticket, DEAL_PRICE);
            double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
            double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
            double entryPrice = 0;

            for (int j = HistoryDealsTotal() - 1; j >= 0; j--) {
                ulong entryTicket = HistoryDealGetTicket(j);
                if (entryTicket == 0) continue;
                if ((ulong)HistoryDealGetInteger(entryTicket, DEAL_POSITION_ID) != posID) continue;
                if ((ENUM_DEAL_ENTRY)HistoryDealGetInteger(entryTicket, DEAL_ENTRY) != DEAL_ENTRY_IN) continue;
                entryPrice = HistoryDealGetDouble(entryTicket, DEAL_PRICE);
                break;
            }

            if (entryPrice != 0 && exitPrice != entryPrice) {
                PriceToPipRatio = MathAbs(profit / (exitPrice - entryPrice));
                CommissionPerPip = -commission / PriceToPipRatio;
                break;
            }
        }

        if (PriceToPipRatio == 0) {
            double tv = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
            double ts = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
            if (ts > 0) PriceToPipRatio = tv / ts;
            CommissionPerPip = 0;
        }
    }

    double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    double newSpread = NormalizeDouble(Ask - Bid, _Digits);
    ArrayCopy(SpreadHistoryArray, SpreadHistoryArray, 0, 1, SpreadArraySize - 1);
    SpreadHistoryArray[SpreadArraySize - 1] = newSpread;
    double spreadSum = 0;
    for (int i = 0; i < SpreadArraySize; i++) spreadSum += SpreadHistoryArray[i];
    CurrentSpread = spreadSum / SpreadArraySize;

    AverageSpread = MathMax(SpreadMultiplier * _Point, CurrentSpread + CommissionPerPip);
    AdjustedOrderdistance = MathMax(AverageSpread * Delta, MinStopDistance);
    MinOrderModification = MathMax(AverageSpread * MinOrderDistance, MinFreezeDistance);
    TrailingStopActive = AverageSpread * MaxTrailing;
    TrailingStopMax = AverageSpread * MaxTrailingLimit;
    MaxOrderPlacementDistance = AverageSpread * MaxDistance;
    OrderPlacementStop = MinOrderModification / OrderModificationFactor;
    CalculatedStopLoss = MathMax(AverageSpread * Stop, MinStopDistance);

    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (!posinfo.SelectByIndex(i)) continue;
        if (posinfo.Symbol() != _Symbol || posinfo.Magic() != InpMagic) continue;
        double price = posinfo.PriceOpen();
        double lots = posinfo.Volume();
        double sl = posinfo.StopLoss();
        if (posinfo.PositionType() == POSITION_TYPE_BUY) {
            OpenBuyCount++;
            if (sl == 0 || sl < price) TotalBuyCount++;
            CurrentBuySL = sl;
            BuyOrdersPriceSum += price * lots;
            BuyOrdersLotSum += lots;
            if (price < LowestBuyPrice) LowestBuyPrice = price;
        } else if (posinfo.PositionType() == POSITION_TYPE_SELL) {
            OpenSellCount++;
            if (sl == 0 || sl > price) TotalSellCount++;
            CurrentSellSL = sl;
            SellOrdersPriceSum += price * lots;
            SellOrdersLotSum += lots;
            if (price > HighestSellPrice) HighestSellPrice = price;
        }
    }

    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;
        if (ordinfo.OrderType() == ORDER_TYPE_BUY_STOP) { PendingBuyCount++; TotalBuyCount++; }
        if (ordinfo.OrderType() == ORDER_TYPE_SELL_STOP) { PendingSellCount++; TotalSellCount++; }
    }

    if (BuyOrdersLotSum > 0) AverageBuyPrice = NormalizeDouble(BuyOrdersPriceSum / BuyOrdersLotSum, _Digits);
    if (SellOrdersLotSum > 0) AverageSellPrice = NormalizeDouble(SellOrdersPriceSum / SellOrdersLotSum, _Digits);

    MqlDateTime BrokerTime;
    TimeCurrent(BrokerTime);
    bool timeOK = (BrokerTime.hour >= StartHour && BrokerTime.hour <= EndHour);
    bool spreadOK = (AverageSpread <= MaxAllowedSpread);

    if (g_EAMode == 3) {
        TrailStop();
        RefreshDashboard(OpenBuyCount, OpenSellCount, PendingBuyCount, PendingSellCount);
        return;
    }

    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;
        if (ordinfo.OrderType() != ORDER_TYPE_BUY_STOP) continue;

        ulong ticket = ordinfo.Ticket();
        double openPrice = ordinfo.PriceOpen();
        double sl = ordinfo.StopLoss();
        double tp = ordinfo.TakeProfit();

        if (!spreadOK || !timeOK || !g_BuysEnabled) { trade.OrderDelete(ticket); continue; }

        int timeDiff = (int)(CurrentTime - LastBuyOrderTime);
        double distToAsk = openPrice - Ask;

        bool needsMod = (timeDiff > Secs) ||
                        (TickCounter % OrderCheckFrequency == 0 &&
                         ((OpenBuyCount < 1 && distToAsk < MinOrderModification) ||
                          distToAsk < OrderPlacementStop ||
                          distToAsk > MaxOrderPlacementDistance));

        if (needsMod) {
            double distance = AdjustedOrderdistance;
            if (OpenBuyCount > 0) distance /= OrderModificationFactor;
            distance = MathMax(distance, MinStopDistance);
            double modPrice = NormalizeDouble(Ask + distance, _Digits);
            double modSL = (OpenBuyCount > 0) ? CurrentBuySL : NormalizeDouble(modPrice - CalculatedStopLoss, _Digits);
            double modTP = NormalizeDouble(modPrice + CalculatedStopLoss * 2, _Digits); // Add TP

            double curAsk = Ask;
            if ((OpenBuyCount == 0 || modPrice > AverageBuyPrice) &&
                modPrice != openPrice &&
                (openPrice - curAsk) > MinFreezeDistance) {
                trade.OrderModify(ticket, modPrice, modSL, modTP, ORDER_TIME_GTC, 0);
                LastBuyOrderTime = CurrentTime;
            }
        }
    }

    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;
        if (ordinfo.OrderType() != ORDER_TYPE_SELL_STOP) continue;

        ulong ticket = ordinfo.Ticket();
        double openPrice = ordinfo.PriceOpen();
        double sl = ordinfo.StopLoss();
        double tp = ordinfo.TakeProfit();

        if (!spreadOK || !timeOK || !g_SellsEnabled) { trade.OrderDelete(ticket); continue; }

        int timeDiff = (int)(CurrentTime - LastSellOrderTime);
        double distToBid = Bid - openPrice;

        bool needsMod = (timeDiff > Secs) ||
                        (TickCounter % OrderCheckFrequency == 0 &&
                         ((OpenSellCount < 1 && distToBid < MinOrderModification) ||
                          distToBid < OrderPlacementStop ||
                          distToBid > MaxOrderPlacementDistance));

        if (needsMod) {
            double distance = AdjustedOrderdistance;
            if (OpenSellCount > 0) distance /= OrderModificationFactor;
            distance = MathMax(distance, MinStopDistance);
            double modPrice = NormalizeDouble(Bid - distance, _Digits);
            double modSL = (OpenSellCount > 0) ? CurrentSellSL : NormalizeDouble(modPrice + CalculatedStopLoss, _Digits);
            double modTP = NormalizeDouble(modPrice - CalculatedStopLoss * 2, _Digits); // Add TP

            double curBid = Bid;
            if ((OpenSellCount == 0 || modPrice < AverageSellPrice) &&
                modPrice != openPrice &&
                (curBid - openPrice) > MinFreezeDistance) {
                trade.OrderModify(ticket, modPrice, modSL, modTP, ORDER_TIME_GTC, 0);
                LastSellOrderTime = CurrentTime;
            }
        }
    }

    TrailStop();

    if (g_BuysEnabled && PendingBuyCount < 1 &&
        ((OrderModificationFactor > 1 && TotalBuyCount < 1) || OpenBuyCount < 1)) {
        if (spreadOK && timeOK && (CurrentTime - LastOrderTime) > MinOrderInterval) {
            CalculatedLotSize = GetLotSize(CalculatedStopLoss);
            double marginRequired = 0.0;
            if (OrderCalcMargin(ORDER_TYPE_BUY_STOP, _Symbol, CalculatedLotSize, Ask, marginRequired) &&
                AccountInfoDouble(ACCOUNT_MARGIN_FREE) > marginRequired) {
                double orderDist = MathMax(MathMax(AdjustedOrderdistance, MinFreezeDistance), MinStopDistance);
                double orderPrice = NormalizeDouble(Ask + orderDist, _Digits);
                double orderSL = (OpenBuyCount > 0) ? CurrentBuySL : NormalizeDouble(orderPrice - CalculatedStopLoss, _Digits);
                double orderTP = NormalizeDouble(orderPrice + CalculatedStopLoss * 2, _Digits);
                if (trade.OrderOpen(_Symbol, ORDER_TYPE_BUY_STOP, CalculatedLotSize, orderPrice, Ask, orderSL, orderTP, ORDER_TIME_GTC, 0, OrderCommentText)) {
                    LastBuyOrderTime = CurrentTime;
                    LastOrderTime = CurrentTime;
                }
            }
        }
    }

    if (g_SellsEnabled && PendingSellCount < 1 &&
        ((OrderModificationFactor > 1 && TotalSellCount < 1) || OpenSellCount < 1)) {
        if (spreadOK && timeOK && (CurrentTime - LastOrderTime) > MinOrderInterval) {
            CalculatedLotSize = GetLotSize(CalculatedStopLoss);
            double marginRequired = 0.0;
            if (OrderCalcMargin(ORDER_TYPE_SELL_STOP, _Symbol, CalculatedLotSize, Bid, marginRequired) &&
                AccountInfoDouble(ACCOUNT_MARGIN_FREE) > marginRequired) {
                double orderDist = MathMax(MathMax(AdjustedOrderdistance, MinFreezeDistance), MinStopDistance);
                double orderPrice = NormalizeDouble(Bid - orderDist, _Digits);
                double orderSL = (OpenSellCount > 0) ? CurrentSellSL : NormalizeDouble(orderPrice + CalculatedStopLoss, _Digits);
                double orderTP = NormalizeDouble(orderPrice - CalculatedStopLoss * 2, _Digits);
                if (trade.OrderOpen(_Symbol, ORDER_TYPE_SELL_STOP, CalculatedLotSize, orderPrice, Bid, orderSL, orderTP, ORDER_TIME_GTC, 0, OrderCommentText)) {
                    LastSellOrderTime = CurrentTime;
                    LastOrderTime = CurrentTime;
                }
            }
        }
    }

    RefreshDashboard(OpenBuyCount, OpenSellCount, PendingBuyCount, PendingSellCount);
}

void TrailStop() {
    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double indbuffer[];

    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (!posinfo.SelectByIndex(i)) continue;
        if (posinfo.Magic() != InpMagic || posinfo.Symbol() != _Symbol) continue;

        ulong ticket = posinfo.Ticket();
        ENUM_POSITION_TYPE type = posinfo.PositionType();
        double sl = posinfo.StopLoss();
        double tp = posinfo.TakeProfit();
        double oprice = posinfo.PriceOpen();
        double newSL = 0;

        if (type == POSITION_TYPE_BUY) {
            switch (g_TrailMode) {
                case 0: {
                    double priceMove = MathMax(bid - oprice + CommissionPerPip, 0);
                    double trailDist = CalculateTrailingStop(priceMove, MinStopDistance, TrailingStopActive, BaseTrailingStop, TrailingStopMax);
                    double trigger = oprice + CommissionPerPip + TrailingStopIncrement;
                    newSL = NormalizeDouble(bid - trailDist, _Digits);
                    if ((bid - trigger) > trailDist && (sl == 0 || (bid - sl) > trailDist) && newSL != sl)
                        trade.PositionModify(ticket, newSL, tp);
                    break;
                }
                case 1:
                    if (bid - oprice > TslTriggerPoints * _Point) {
                        newSL = NormalizeDouble(bid - TslPoints * _Point, _Digits);
                        if (newSL > sl && newSL > oprice && newSL < bid)
                            trade.PositionModify(ticket, newSL, tp);
                    }
                    break;
                case 2:
                    if (bid - oprice > TslTriggerPoints * _Point) {
                        newSL = NormalizeDouble(iLow(_Symbol, PERIOD_CURRENT, PrvCandleN), _Digits);
                        if (newSL > sl && newSL > oprice && newSL < bid)
                            trade.PositionModify(ticket, newSL, tp);
                    }
                    break;
                case 3:
                    if (bid - oprice > TslTriggerPoints * _Point)
                        if (handleTrailMA != INVALID_HANDLE && CopyBuffer(handleTrailMA, MAIN_LINE, 1, 1, indbuffer) > 0) {
                            ArraySetAsSeries(indbuffer, true);
                            newSL = NormalizeDouble(indbuffer[0], _Digits);
                            if (newSL > sl && newSL > oprice && newSL < bid)
                                trade.PositionModify(ticket, newSL, tp);
                        }
                    break;
                case 4:
                    if (bid - oprice > TslTriggerPoints * _Point)
                        if (handleIchimoku != INVALID_HANDLE && CopyBuffer(handleIchimoku, TENKANSEN_LINE, 1, 1, indbuffer) > 0) {
                            ArraySetAsSeries(indbuffer, true);
                            newSL = NormalizeDouble(indbuffer[0], _Digits);
                            if (newSL > sl && newSL > oprice && newSL < bid)
                                trade.PositionModify(ticket, newSL, tp);
                        }
                    break;
                default: break;
            }
        } else if (type == POSITION_TYPE_SELL) {
            switch (g_TrailMode) {
                case 0: {
                    double priceMove = MathMax(oprice - ask - CommissionPerPip, 0);
                    double trailDist = CalculateTrailingStop(priceMove, MinStopDistance, TrailingStopActive, BaseTrailingStop, TrailingStopMax);
                    double trigger = oprice - CommissionPerPip - TrailingStopIncrement;
                    newSL = NormalizeDouble(ask + trailDist, _Digits);
                    if ((trigger - ask) > trailDist && (sl == 0 || (sl - ask) > trailDist) && newSL != sl)
                        trade.PositionModify(ticket, newSL, tp);
                    break;
                }
                case 1:
                    if (ask + TslTriggerPoints * _Point < oprice) {
                        newSL = NormalizeDouble(ask + TslPoints * _Point, _Digits);
                        if ((sl == 0 || newSL < sl) && newSL < oprice && newSL > ask)
                            trade.PositionModify(ticket, newSL, tp);
                    }
                    break;
                case 2:
                    if (ask + TslTriggerPoints * _Point < oprice) {
                        newSL = NormalizeDouble(iHigh(_Symbol, PERIOD_CURRENT, PrvCandleN), _Digits);
                        if ((sl == 0 || newSL < sl) && newSL < oprice && newSL > ask)
                            trade.PositionModify(ticket, newSL, tp);
                    }
                    break;
                case 3:
                    if (ask + TslTriggerPoints * _Point < oprice)
                        if (handleTrailMA != INVALID_HANDLE && CopyBuffer(handleTrailMA, MAIN_LINE, 1, 1, indbuffer) > 0) {
                            ArraySetAsSeries(indbuffer, true);
                            newSL = NormalizeDouble(indbuffer[0], _Digits);
                            if ((sl == 0 || newSL < sl) && newSL < oprice && newSL > ask)
                                trade.PositionModify(ticket, newSL, tp);
                        }
                    break;
                case 4:
                    if (ask + TslTriggerPoints * _Point < oprice)
                        if (handleIchimoku != INVALID_HANDLE && CopyBuffer(handleIchimoku, TENKANSEN_LINE, 1, 1, indbuffer) > 0) {
                            ArraySetAsSeries(indbuffer, true);
                            newSL = NormalizeDouble(indbuffer[0], _Digits);
                            if ((sl == 0 || newSL < sl) && newSL < oprice && newSL > ask)
                                trade.PositionModify(ticket, newSL, tp);
                        }
                    break;
                default: break;
            }
        }
    }
}

void SetTrailMode(int mode) {
    if (mode == g_TrailMode) return;

    if (g_TrailMode == (int)Fast_MA && mode != (int)Fast_MA && handleTrailMA != INVALID_HANDLE) {
        IndicatorRelease(handleTrailMA);
        handleTrailMA = INVALID_HANDLE;
    }
    if (g_TrailMode == (int)Tenkansen && mode != (int)Tenkansen && handleIchimoku != INVALID_HANDLE) {
        IndicatorRelease(handleIchimoku);
        handleIchimoku = INVALID_HANDLE;
    }

    g_TrailMode = mode;

    if (g_TrailMode == (int)Fast_MA && handleTrailMA == INVALID_HANDLE)
        handleTrailMA = iMA(_Symbol, PERIOD_CURRENT, FMAperiod, 0, MA_Mode, MA_AppPrice);
    if (g_TrailMode == (int)Tenkansen && handleIchimoku == INVALID_HANDLE)
        handleIchimoku = iIchimoku(_Symbol, PERIOD_CURRENT, 9, 26, 52);
}

double CalculateTrailingStop(double priceMove, double minDist, double activeDist, double baseDist, double maxDist) {
    if (maxDist == 0) return MathMax(activeDist, minDist);
    double ratio = priceMove / maxDist;
    double dynamicDist = (activeDist - baseDist) * ratio + baseDist;
    return MathMax(MathMin(dynamicDist, activeDist), minDist);
}

double GetLotSize(double slPoints) {
    if (LotType == Fixed_Lots) {
        double lots = MathCeil(FixedLot / LotStepSize) * LotStepSize;
        return MathMax(lots, MinLotSize);
    }

    double balance = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity = AccountInfoDouble(ACCOUNT_EQUITY);
    double margin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
    double risk = 0;

    switch (LotType) {
        case Pct_of_Balance: risk = balance * RiskPercent / 100; break;
        case Pct_of_Equity: risk = equity * RiskPercent / 100; break;
        case Pct_ofFreeMargin: risk = margin * RiskPercent / 100; break;
        default: risk = balance * RiskPercent / 100; break;
    }

    double ticksize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
    double tickvalue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);

    if (ticksize == 0 || tickvalue == 0 || slPoints == 0) return MinLotSize;
    double moneyPerLotstep = slPoints / ticksize * tickvalue * LotStepSize;
    if (moneyPerLotstep == 0) return MinLotSize;

    double lots = MathFloor(risk / moneyPerLotstep) * LotStepSize;
    double volumelimit = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_LIMIT);
    if (volumelimit != 0) lots = MathMin(lots, volumelimit);
    lots = MathMin(lots, MaxLotSize);
    lots = MathMax(lots, MinLotSize);
    return NormalizeDouble(lots, 2);
}

void CloseAllPositions() {
    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (!posinfo.SelectByIndex(i)) continue;
        if (posinfo.Symbol() != _Symbol || posinfo.Magic() != InpMagic) continue;
        trade.PositionClose(posinfo.Ticket());
    }
}

void DeletePendingByType(ENUM_ORDER_TYPE orderType) {
    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;
        if (ordinfo.OrderType() == orderType) trade.OrderDelete(ordinfo.Ticket());
    }
}

void DeleteAllPending() {
    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;
        trade.OrderDelete(ordinfo.Ticket());
    }
}

#define PNL_W 220
#define PNL_H 310
#define BTN_W 96
#define BTN_H 22
#define ROW_H 26

#define CLR_PANEL C'25,25,35'
#define CLR_HDR C'40,40,60'
#define CLR_ACTIVE C'0,180,100'
#define CLR_INACTIVE C'60,60,80'
#define CLR_PAUSE C'200,80,0'
#define CLR_DANGER C'180,30,30'
#define CLR_TEXT_ON clrWhite
#define CLR_TEXT_OFF C'160,160,180'
#define CLR_TITLE C'120,200,255'

void CreateLabel(string name, string text, int x, int y, int fs, color clr, ENUM_ANCHOR_POINT anchor = ANCHOR_LEFT_UPPER) {
    ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, name, OBJPROP_XDISTANCE, (long)x);
    ObjectSetInteger(0, name, OBJPROP_YDISTANCE, (long)y);
    ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, name, OBJPROP_ANCHOR, (long)anchor);
    ObjectSetInteger(0, name, OBJPROP_FONTSIZE, (long)fs);
    ObjectSetInteger(0, name, OBJPROP_COLOR, (long)clr);
    ObjectSetString(0, name, OBJPROP_FONT, "Segoe UI");
    ObjectSetString(0, name, OBJPROP_TEXT, text);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void CreateRect(string name, int x, int y, int w, int h, color bg, color borderClr = (color)0) {
    ObjectCreate(0, name, OBJ_RECTANGLE_LABEL, 0, 0, 0);
    ObjectSetInteger(0, name, OBJPROP_XDISTANCE, (long)x);
    ObjectSetInteger(0, name, OBJPROP_YDISTANCE, (long)y);
    ObjectSetInteger(0, name, OBJPROP_XSIZE, (long)w);
    ObjectSetInteger(0, name, OBJPROP_YSIZE, (long)h);
    ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, name, OBJPROP_BGCOLOR, (long)bg);
    ObjectSetInteger(0, name, OBJPROP_BORDER_COLOR, (long)(borderClr == (color)0 ? bg : borderClr));
    ObjectSetInteger(0, name, OBJPROP_BORDER_TYPE, BORDER_FLAT);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void CreateButton(string name, string text, int x, int y, int w, int h, color bg, color fg) {
    ObjectCreate(0, name, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, name, OBJPROP_XDISTANCE, (long)x);
    ObjectSetInteger(0, name, OBJPROP_YDISTANCE, (long)y);
    ObjectSetInteger(0, name, OBJPROP_XSIZE, (long)w);
    ObjectSetInteger(0, name, OBJPROP_YSIZE, (long)h);
    ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, name, OBJPROP_BGCOLOR, (long)bg);
    ObjectSetInteger(0, name, OBJPROP_COLOR, (long)fg);
    ObjectSetInteger(0, name, OBJPROP_FONTSIZE, 8L);
    ObjectSetString(0, name, OBJPROP_FONT, "Segoe UI");
    ObjectSetString(0, name, OBJPROP_TEXT, text);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
    ObjectSetInteger(0, name, OBJPROP_STATE, false);
}

void SetButtonColor(string name, color bg, color fg) {
    ObjectSetInteger(0, name, OBJPROP_BGCOLOR, (long)bg);
    ObjectSetInteger(0, name, OBJPROP_COLOR, (long)fg);
}

void BuildDashboard() {
    int x = DashX;
    int y = DashY;

    CreateRect(LBL_PANEL_BG, x, y, PNL_W, PNL_H, CLR_PANEL, C'80,80,120');
    CreateRect("CJ_TITLEBAR", x, y, PNL_W, 24, CLR_HDR);
    CreateLabel(LBL_TITLE, "⚡ CEEJAY HF HQ v2.10", x + 8, y + 4, 9, CLR_TITLE);

    int row = y + 30;

    CreateRect("CJ_HDR_MODE", x, row, PNL_W, 18, CLR_HDR);
    CreateLabel(LBL_MODE_HDR, "  EA MODE", x + 4, row + 2, 8, CLR_TEXT_OFF);
    row += 22;

    CreateButton(BTN_MODE_NORMAL, "▶ Normal", x + 4, row, BTN_W, BTN_H, CLR_ACTIVE, CLR_TEXT_ON);
    CreateButton(BTN_MODE_BUYONLY, "▲ Buy Only", x + 4 + BTN_W + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    row += ROW_H;

    CreateButton(BTN_MODE_SELLONLY, "▼ Sell Only", x + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    CreateButton(BTN_MODE_PAUSE, "⏸ Pause", x + 4 + BTN_W + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    row += ROW_H + 6;

    CreateRect("CJ_HDR_TRAIL", x, row, PNL_W, 18, CLR_HDR);
    CreateLabel(LBL_TRAIL_HDR, "  TRAILING MODE", x + 4, row + 2, 8, CLR_TEXT_OFF);
    row += 22;

    CreateButton(BTN_TRAIL_DEF, "Default", x + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    CreateButton(BTN_TRAIL_SCALP, "Scalp", x + 4 + BTN_W + 4, row, BTN_W, BTN_H, CLR_ACTIVE, CLR_TEXT_ON);
    row += ROW_H;

    CreateButton(BTN_TRAIL_CANDLE, "Prev Candle", x + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    CreateButton(BTN_TRAIL_MA, "Fast MA", x + 4 + BTN_W + 4, row, BTN_W, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    row += ROW_H;

    CreateButton(BTN_TRAIL_ICHI, "Ichimoku Tenkan", x + 4, row, PNL_W - 8, BTN_H, CLR_INACTIVE, CLR_TEXT_OFF);
    row += ROW_H + 6;

    CreateRect("CJ_HDR_STATS", x, row, PNL_W, 18, CLR_HDR);
    CreateLabel("CJ_LBL_STATS_HDR", "  LIVE STATS", x + 4, row + 2, 8, CLR_TEXT_OFF);
    row += 22;
    CreateLabel("CJ_STAT1", "Buy:  0 open  | 0 pending", x + 8, row, 8, CLR_TEXT_OFF);
    CreateLabel("CJ_STAT2", "Sell: 0 open  | 0 pending", x + 8, row + 14, 8, CLR_TEXT_OFF);
    row += 34;

    CreateButton(BTN_CLOSE_ALL, "✖  CLOSE ALL & DELETE PENDING", x + 4, row, PNL_W - 8, BTN_H, CLR_DANGER, CLR_TEXT_ON);

    SyncModeButtons();
    SyncTrailButtons();

    ChartRedraw();
}

void SyncModeButtons() {
    SetButtonColor(BTN_MODE_NORMAL, g_EAMode == 0 ? CLR_ACTIVE : CLR_INACTIVE, g_EAMode == 0 ? CLR_TEXT_ON : CLR_TEXT_OFF);
    SetButtonColor(BTN_MODE_BUYONLY, g_EAMode == 1 ? CLR_ACTIVE : CLR_INACTIVE, g_EAMode == 1 ? CLR_TEXT_ON : CLR_TEXT_OFF);
    SetButtonColor(BTN_MODE_SELLONLY, g_EAMode == 2 ? CLR_ACTIVE : CLR_INACTIVE, g_EAMode == 2 ? CLR_TEXT_ON : CLR_TEXT_OFF);
    SetButtonColor(BTN_MODE_PAUSE, g_EAMode == 3 ? CLR_PAUSE : CLR_INACTIVE, g_EAMode == 3 ? CLR_TEXT_ON : CLR_TEXT_OFF);

    ObjectSetInteger(0, BTN_MODE_NORMAL, OBJPROP_STATE, false);
    ObjectSetInteger(0, BTN_MODE_BUYONLY, OBJPROP_STATE, false);
    ObjectSetInteger(0, BTN_MODE_SELLONLY, OBJPROP_STATE, false);
    ObjectSetInteger(0, BTN_MODE_PAUSE, OBJPROP_STATE, false);
}

void SyncTrailButtons() {
    string btns[5] = { BTN_TRAIL_DEF, BTN_TRAIL_SCALP, BTN_TRAIL_CANDLE, BTN_TRAIL_MA, BTN_TRAIL_ICHI };
    for (int i = 0; i < 5; i++) {
        bool active = (i == g_TrailMode);
        SetButtonColor(btns[i], active ? CLR_ACTIVE : CLR_INACTIVE, active ? CLR_TEXT_ON : CLR_TEXT_OFF);
        ObjectSetInteger(0, btns[i], OBJPROP_STATE, false);
    }
}

void RefreshDashboard(int buyOpen, int sellOpen, int buyPend, int sellPend) {
    SyncModeButtons();
    SyncTrailButtons();

    ObjectSetString(0, "CJ_STAT1", OBJPROP_TEXT, StringFormat("Buy:  %d open  |  %d pending", buyOpen, buyPend));
    ObjectSetString(0, "CJ_STAT2", OBJPROP_TEXT, StringFormat("Sell: %d open  |  %d pending", sellOpen, sellPend));

    ChartRedraw();
}

void DestroyDashboard() {
    string names[] = {
        LBL_PANEL_BG, "CJ_TITLEBAR", LBL_TITLE,
        "CJ_HDR_MODE", LBL_MODE_HDR,
        BTN_MODE_NORMAL, BTN_MODE_BUYONLY, BTN_MODE_SELLONLY, BTN_MODE_PAUSE,
        "CJ_HDR_TRAIL", LBL_TRAIL_HDR,
        BTN_TRAIL_DEF, BTN_TRAIL_SCALP, BTN_TRAIL_CANDLE, BTN_TRAIL_MA, BTN_TRAIL_ICHI,
        "CJ_HDR_STATS", "CJ_LBL_STATS_HDR", "CJ_STAT1", "CJ_STAT2",
        BTN_CLOSE_ALL
    };
    for (int i = 0; i < ArraySize(names); i++) ObjectDelete(0, names[i]);
    ChartRedraw();
}