#property copyright "Copyright 2026, Ceejay - Rewritten"
#property version "2.00"

#include <Trade\Trade.mqh>
CTrade trade;
CPositionInfo posinfo;
COrderInfo ordinfo;
CHistoryOrderInfo hisinfo;
CDealInfo dealinfo;

enum enumLotType { Fixed_Lots = 0, Pct_of_Balance = 1, Pct_of_Equity = 2, Pct_ofFreeMargin = 3 };

input group "GENERAL SETTINGS";
input int InpMagic = 12345; // Magic no.
input int Slippage = 1;

input group "TIME SETTINGS";
input int StartHour = 1; // Start Trading Hour
input int EndHour = 22; // End Trading Hour
input int Secs = 60; // Order Modifications (Should be as same as TF)

input group "MONEY MANAGEMENT";
input enumLotType LotType = 0;
input double FixedLot = 0.01;
input double RiskPercent = 0.1;

input group "DISTANCE SETTINGS";
input double Delta = 0.5; // Order Distance
input double MaxDistance = 7;
input double Stop = 10; // Stop Loss size
input double MaxTrailing = 4;
input int MaxSpread = 3; // Max spread limit

input group "TRAILING STOP MANAGEMENT";
enum TSLType { Default_Trail = 0, Scalp_Trail = 1, Previous_Candle = 2, Fast_MA = 3, Tenkansen = 4 };
input TSLType TrailType = 1;
input int TslTriggerPoints = 15;
input int TslPoints = 10;
input int PrvCandleN = 1;
input int FMAperiod = 5;
input ENUM_MA_METHOD MA_Mode = MODE_EMA;
input ENUM_APPLIED_PRICE MA_AppPrice = PRICE_MEDIAN;

double DeltaX = Delta;
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
double MarginPerMinLot = 0;
double MinStopDistance = 0;
int BrokerStopLevel = 0;
double MinFreezeDistance = 0;
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
bool AllowBuyOrders = true;
bool AllowSellOrders = true;
bool SpreadAcceptable = false;
int LastOrderTimeDiff = 0;
int LastOrderTime = 0;
int MinOrderInterval = 0;
double CurrentBuySL = 0;
string OrderCommentText = "Ceejay";
int LastBuyOrderTime = 0;
bool TradeAllowed = true;

int LastSellOrderTime = 0;
int OrderCheckFrequency = 2;
int SpreadCalculationMethod = 1;
bool EnableTrading = true;
double SpreadHistoryArray[];

int handleTrailMA, handleIchimoku;

int OnInit() {
    trade.SetExpertMagicNumber(InpMagic);
    ChartSetInteger(0, CHART_SHOW_GRID, false);

    if (TrailType == 3) handleTrailMA = iMA(_Symbol, PERIOD_CURRENT, FMAperiod, 0, MA_Mode, MA_AppPrice);
    if (TrailType == 4) handleIchimoku = iIchimoku(_Symbol, PERIOD_CURRENT, 9, 26, 52);

    OrderCommentText = "";
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

    double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    CurrentSpread = NormalizeDouble(Ask - Bid, _Digits);
    AverageSpread = CurrentSpread;

    MaxAllowedSpread = NormalizeDouble((MaxSpread * _Point), _Digits);

    TesterHideIndicators(true);

    // Broker checks
    BrokerStopLevel = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
    if (BrokerStopLevel > 0) MinStopDistance = (BrokerStopLevel + 1) * _Point;
    BrokerFreezeLevel = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
    if (BrokerFreezeLevel > 0) MinFreezeDistance = (BrokerFreezeLevel + 1) * _Point;
    if (BrokerStopLevel > 0 || BrokerFreezeLevel > 0) {
        Comment("WARNING! Broker is not suitable, the stoplevel is greater than zero");
    }

    LotStepSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
    MaxLotSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
    MinLotSize = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    MarginPerMinLot = SymbolInfoDouble(_Symbol, SYMBOL_MARGIN_INITIAL) * MinLotSize;

    AccountLeverageValue = AccountInfoInteger(ACCOUNT_LEVERAGE);

    return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {
    // Cleanup if needed
}

void OnTick() {
    int CurrentTime = (int)TimeCurrent();
    int PendingBuyCount = 0;
    int PendingSellCount = 0;
    int OpenBuyCount = 0;
    int OpenSellCount = 0;
    int TotalBuyCount = 0;
    int TotalSellCount = 0;
    double BuyOrdersPriceSum = 0;
    double BuyOrdersLotSum = 0;
    double SellOrdersPriceSum = 0;
    double SellOrdersLotSum = 0;
    double AverageBuyPrice = 0;
    double AverageSellPrice = 0;
    double LowestBuyPrice = 99999;
    double HighestSellPrice = 0;

    TickCounter++;

    // Calculate PriceToPipRatio if not set
    if (PriceToPipRatio == 0) {
        HistorySelect(0, TimeCurrent());
        for (int i = HistoryDealsTotal() - 1; i >= 0; i--) {
            ulong ticket = HistoryDealGetTicket(i);
            if (ticket == 0) continue;
            if (HistoryDealGetString(ticket, DEAL_SYMBOL) != _Symbol) continue;
            if (HistoryDealGetDouble(ticket, DEAL_PROFIT) == 0) continue;
            if (HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;

            ulong posID = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
            if (posID == 0) continue;

            if (HistoryDealSelect(posID)) {
                double entryPrice = HistoryDealGetDouble(posID, DEAL_PRICE);
                double exitPrice = HistoryDealGetDouble(ticket, DEAL_PRICE);
                double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
                double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);

                if (exitPrice != entryPrice) {
                    PriceToPipRatio = fabs(profit / (exitPrice - entryPrice));
                    CommissionPerPip = -commission / PriceToPipRatio;
                    break;
                }
            }
        }
    }

    double Ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double Bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    // Update spread history
    double newSpread = NormalizeDouble(Ask - Bid, _Digits);
    ArrayCopy(SpreadHistoryArray, SpreadHistoryArray, 0, 1, SpreadArraySize - 1);
    SpreadHistoryArray[SpreadArraySize - 1] = newSpread;

    double sum = 0;
    for (int i = 0; i < SpreadArraySize; i++) {
        sum += SpreadHistoryArray[i];
    }
    CurrentSpread = sum / SpreadArraySize;
    AverageSpread = MathMax(SpreadMultiplier * _Point, CurrentSpread + CommissionPerPip);

    // Calculate distances
    AdjustedOrderdistance = MathMax(AverageSpread * Delta, MinStopDistance);
    MinOrderModification = MathMax(AverageSpread * MinOrderDistance, MinFreezeDistance);
    TrailingStopActive = AverageSpread * MaxTrailing;
    TrailingStopMax = AverageSpread * MaxTrailingLimit;
    MaxOrderPlacementDistance = AverageSpread * MaxDistance;
    OrderPlacementStop = MinOrderModification / OrderModificationFactor;
    CalculatedStopLoss = MathMax(AverageSpread * Stop, MinStopDistance);

    // Count positions and orders
    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (posinfo.SelectByIndex(i) && posinfo.Symbol() == _Symbol && posinfo.Magic() == InpMagic) {
            double price = posinfo.PriceOpen();
            double lots = posinfo.Volume();
            double sl = posinfo.StopLoss();

            if (posinfo.PositionType() == POSITION_TYPE_BUY) {
                OpenBuyCount++;
                if (sl == 0 || (sl > 0 && sl < price)) TotalBuyCount++;
                CurrentBuySL = sl;
                BuyOrdersPriceSum += price * lots;
                BuyOrdersLotSum += lots;
                if (price < LowestBuyPrice) LowestBuyPrice = price;
            } else if (posinfo.PositionType() == POSITION_TYPE_SELL) {
                OpenSellCount++;
                if (sl == 0 || (sl > 0 && sl > price)) TotalSellCount++;
                CurrentSellSL = sl;
                SellOrdersPriceSum += price * lots;
                SellOrdersLotSum += lots;
                if (price > HighestSellPrice) HighestSellPrice = price;
            }
        }
    }

    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (ordinfo.SelectByIndex(i) && ordinfo.Symbol() == _Symbol && ordinfo.Magic() == InpMagic) {
            if (ordinfo.OrderType() == ORDER_TYPE_BUY_STOP) {
                PendingBuyCount++;
                TotalBuyCount++;
            } else if (ordinfo.OrderType() == ORDER_TYPE_SELL_STOP) {
                PendingSellCount++;
                TotalSellCount++;
            }
        }
    }

    if (BuyOrdersLotSum > 0) {
        AverageBuyPrice = NormalizeDouble((BuyOrdersPriceSum / BuyOrdersLotSum), _Digits);
    }
    if (SellOrdersLotSum > 0) {
        AverageSellPrice = NormalizeDouble((SellOrdersPriceSum / SellOrdersLotSum), _Digits);
    }

    MqlDateTime BrokerTime;
    TimeCurrent(BrokerTime);

    // Process pending orders
    for (int i = OrdersTotal() - 1; i >= 0; i--) {
        if (!ordinfo.SelectByIndex(i)) continue;
        if (ordinfo.Symbol() != _Symbol || ordinfo.Magic() != InpMagic) continue;

        ulong ticket = ordinfo.Ticket();
        ENUM_ORDER_TYPE type = ordinfo.OrderType();
        double openPrice = ordinfo.PriceOpen();
        double sl = ordinfo.StopLoss();
        double tp = ordinfo.TakeProfit();
        double lots = ordinfo.VolumeCurrent();

        if (type == ORDER_TYPE_BUY_STOP) {
            bool allowTrade = (BrokerTime.hour >= StartHour && BrokerTime.hour <= EndHour);
            if (AverageSpread > MaxAllowedSpread || !allowTrade) {
                trade.OrderDelete(ticket);
                continue;
            }

            int timeDiff = (int)(CurrentTime - LastBuyOrderTime);
            bool needsModification = (timeDiff > Secs) ||
                                     (TickCounter % OrderCheckFrequency == 0 &&
                                      ((OpenBuyCount < 1 && (openPrice - Ask) < MinOrderModification) ||
                                       (openPrice - Ask) < OrderPlacementStop ||
                                       (openPrice - Ask) > MaxOrderPlacementDistance));

            if (needsModification) {
                double distance = AdjustedOrderdistance;
                if (OpenBuyCount > 0) distance /= OrderModificationFactor;
                distance = MathMax(distance, MinStopDistance);

                double modifiedPrice = NormalizeDouble(Ask + distance, _Digits);
                double modifiedSl = (OpenBuyCount > 0) ? CurrentBuySL : NormalizeDouble(modifiedPrice - CalculatedStopLoss, _Digits);
                double modifiedTp = NormalizeDouble(modifiedPrice + CalculatedStopLoss * 2, _Digits); // Add TP

                if ((OpenBuyCount == 0 || modifiedPrice > AverageBuyPrice) && modifiedPrice != openPrice && (openPrice - Ask) > MinFreezeDistance) {
                    trade.OrderModify(ticket, modifiedPrice, modifiedSl, modifiedTp, ORDER_TIME_GTC, 0);
                    LastBuyOrderTime = CurrentTime;
                }
            }
        } else if (type == ORDER_TYPE_SELL_STOP) {
            bool allowTrade = (BrokerTime.hour >= StartHour && BrokerTime.hour <= EndHour);
            if (AverageSpread > MaxAllowedSpread || !allowTrade) {
                trade.OrderDelete(ticket);
                continue;
            }

            int timeDiff = (int)(CurrentTime - LastSellOrderTime);
            bool needsModification = (timeDiff > Secs) ||
                                     (TickCounter % OrderCheckFrequency == 0 &&
                                      ((OpenSellCount < 1 && (Bid - openPrice) < MinOrderModification) ||
                                       (Bid - openPrice) < OrderPlacementStop ||
                                       (Bid - openPrice) > MaxOrderPlacementDistance));

            if (needsModification) {
                double distance = AdjustedOrderdistance;
                if (OpenSellCount > 0) distance /= OrderModificationFactor;
                distance = MathMax(distance, MinStopDistance);

                double modifiedPrice = NormalizeDouble(Bid - distance, _Digits);
                double modifiedSl = (OpenSellCount > 0) ? CurrentSellSL : NormalizeDouble(modifiedPrice + CalculatedStopLoss, _Digits);
                double modifiedTp = NormalizeDouble(modifiedPrice - CalculatedStopLoss * 2, _Digits); // Add TP

                if ((OpenSellCount == 0 || modifiedPrice < AverageSellPrice) && modifiedPrice != openPrice && (Bid - openPrice) > MinFreezeDistance) {
                    trade.OrderModify(ticket, modifiedPrice, modifiedSl, modifiedTp, ORDER_TIME_GTC, 0);
                    LastSellOrderTime = CurrentTime;
                }
            }
        }
    }

    // Trailing stops
    TrailStop();

    // Place new orders
    if ((OrderModificationFactor > 1 && TotalBuyCount < 1) || OpenBuyCount < 1) {
        if (PendingBuyCount < 1) {
            bool spreadOK = (AverageSpread <= MaxAllowedSpread);
            bool timeOK = (BrokerTime.hour >= StartHour && BrokerTime.hour <= EndHour);

            if (spreadOK && timeOK && (CurrentTime - LastOrderTime) > MinOrderInterval) {
                if (LotType == 0) {
                    CalculatedLotSize = MathCeil(FixedLot / LotStepSize) * LotStepSize;
                    CalculatedLotSize = MathMax(CalculatedLotSize, MinLotSize);
                } else if (LotType > 0) {
                    CalculatedLotSize = calcLots(CalculatedStopLoss);
                }

                double marginRequired = 0.0;
                if (OrderCalcMargin(ORDER_TYPE_BUY_STOP, _Symbol, CalculatedLotSize, Ask, marginRequired) &&
                    AccountInfoDouble(ACCOUNT_MARGIN_FREE) > marginRequired) {
                    double orderDist = MathMax(MathMax(AdjustedOrderdistance, MinFreezeDistance), MinStopDistance);
                    double orderPrice = NormalizeDouble(Ask + orderDist, _Digits);
                    double orderSL = (OpenBuyCount > 0) ? CurrentBuySL : NormalizeDouble(orderPrice - CalculatedStopLoss, _Digits);
                    double orderTP = NormalizeDouble(orderPrice + CalculatedStopLoss * 2, _Digits);

                    if (trade.OrderOpen(_Symbol, ORDER_TYPE_BUY_STOP, CalculatedLotSize, orderPrice, Ask, orderSL, orderTP, ORDER_TIME_GTC, 0, OrderCommentText)) {
                        LastBuyOrderTime = (int)TimeCurrent();
                        LastOrderTime = (int)TimeCurrent();
                    }
                }
            }
        }
    }

    if ((OrderModificationFactor > 1 && TotalSellCount < 1) || OpenSellCount < 1) {
        if (PendingSellCount < 1) {
            bool spreadOK = (AverageSpread <= MaxAllowedSpread);
            bool timeOK = (BrokerTime.hour >= StartHour && BrokerTime.hour <= EndHour);

            if (spreadOK && timeOK && (CurrentTime - LastOrderTime) > MinOrderInterval) {
                if (LotType == 0) {
                    CalculatedLotSize = MathCeil(FixedLot / LotStepSize) * LotStepSize;
                    CalculatedLotSize = MathMax(CalculatedLotSize, MinLotSize);
                } else if (LotType > 0) {
                    CalculatedLotSize = calcLots(CalculatedStopLoss);
                }

                double marginRequired = 0.0;
                if (OrderCalcMargin(ORDER_TYPE_SELL_STOP, _Symbol, CalculatedLotSize, Bid, marginRequired) &&
                    AccountInfoDouble(ACCOUNT_MARGIN_FREE) > marginRequired) {
                    double orderDist = MathMax(MathMax(AdjustedOrderdistance, MinFreezeDistance), MinStopDistance);
                    double orderPrice = NormalizeDouble(Bid - orderDist, _Digits);
                    double orderSL = (OpenSellCount > 0) ? CurrentSellSL : NormalizeDouble(orderPrice + CalculatedStopLoss, _Digits);
                    double orderTP = NormalizeDouble(orderPrice - CalculatedStopLoss * 2, _Digits);

                    if (trade.OrderOpen(_Symbol, ORDER_TYPE_SELL_STOP, CalculatedLotSize, orderPrice, Bid, orderSL, orderTP, ORDER_TIME_GTC, 0, OrderCommentText)) {
                        LastSellOrderTime = (int)TimeCurrent();
                        LastOrderTime = (int)TimeCurrent();
                    }
                }
            }
        }
    }
}

double CalculateTrailingStop(double priceMove, double minDist, double activeDist, double baseDist, double maxDist) {
    if (maxDist == 0) return MathMax(activeDist, minDist);
    if (maxDist < 0.0001) return MathMax(activeDist, minDist); // Guard against divide by zero
    double ratio = MathMin(priceMove / maxDist, 1.0); // Clamp ratio to 0-1
    double dynamicDist = (activeDist - baseDist) * ratio + baseDist;
    return MathMax(MathMin(dynamicDist, activeDist), minDist);
}

double calcLots(double slPoints) {
    double lots = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    double AccountBalance = AccountInfoDouble(ACCOUNT_BALANCE);
    double EquityBalance = AccountInfoDouble(ACCOUNT_EQUITY);
    double FreeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);

    double risk = 0;
    switch (LotType) {
        case 0: lots = FixedLot; return lots;
        case 1: risk = AccountBalance * RiskPercent / 100; break;
        case 2: risk = EquityBalance * RiskPercent / 100; break;
        case 3: risk = FreeMargin * RiskPercent / 100; break;
    }

    double ticksize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
    double tickvalue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
    double lotstep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

    if (slPoints == 0 || ticksize == 0 || tickvalue == 0) return MinLotSize;
    double moneyPerLotstep = slPoints / ticksize * tickvalue * lotstep;
    if (moneyPerLotstep == 0) return MinLotSize;
    lots = MathFloor(risk / moneyPerLotstep) * lotstep;

    double minvolume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    double maxvolume = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
    double volumelimit = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_LIMIT);

    if (volumelimit != 0) lots = MathMin(lots, volumelimit);
    if (maxvolume != 0) lots = MathMin(lots, maxvolume);
    if (minvolume != 0) lots = MathMin(lots, minvolume);
    lots = NormalizeDouble(lots, 2);

    return lots;
}

void TrailStop() {
    if (TrailType == 0) {
        for (int i = PositionsTotal() - 1; i >= 0; i--) {
            if (!posinfo.SelectByIndex(i)) continue;
            if (posinfo.Symbol() != _Symbol || posinfo.Magic() != InpMagic) continue;

            ulong ticket = posinfo.Ticket();
            ENUM_POSITION_TYPE type = posinfo.PositionType();
            double openPrice = posinfo.PriceOpen();
            double sl = posinfo.StopLoss();
            double tp = posinfo.TakeProfit();

            if (type == POSITION_TYPE_BUY) {
                double priceMove = MathMax(SymbolInfoDouble(_Symbol, SYMBOL_BID) - openPrice + CommissionPerPip, 0);
                double trailDist = CalculateTrailingStop(priceMove, MinStopDistance, TrailingStopActive, BaseTrailingStop, TrailingStopMax);

                double modifiedSl = NormalizeDouble(SymbolInfoDouble(_Symbol, SYMBOL_BID) - trailDist, _Digits);
                double triggerLevel = openPrice + CommissionPerPip + TrailingStopIncrement;

                if ((SymbolInfoDouble(_Symbol, SYMBOL_BID) - triggerLevel) > trailDist &&
                    (sl == 0 || (SymbolInfoDouble(_Symbol, SYMBOL_BID) - sl) > trailDist) &&
                    modifiedSl != sl) {
                    trade.PositionModify(ticket, modifiedSl, tp);
                }
            } else if (type == POSITION_TYPE_SELL) {
                double priceMove = MathMax(openPrice - SymbolInfoDouble(_Symbol, SYMBOL_ASK) - CommissionPerPip, 0);
                double trailDist = CalculateTrailingStop(priceMove, MinStopDistance, TrailingStopActive, BaseTrailingStop, TrailingStopMax);

                double modifiedSl = NormalizeDouble(SymbolInfoDouble(_Symbol, SYMBOL_ASK) + trailDist, _Digits);
                double triggerLevel = openPrice - CommissionPerPip - TrailingStopIncrement;

                if ((triggerLevel - SymbolInfoDouble(_Symbol, SYMBOL_ASK)) > trailDist &&
                    (sl == 0 || (sl - SymbolInfoDouble(_Symbol, SYMBOL_ASK)) > trailDist) &&
                    modifiedSl != sl) {
                    trade.PositionModify(ticket, modifiedSl, tp);
                }
            }
        }
        return;
    }

    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double indbuffer[];

    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (posinfo.SelectByIndex(i)) {
            ulong ticket = posinfo.Ticket();
            if (posinfo.Magic() == InpMagic && posinfo.Symbol() == _Symbol) {
                if (posinfo.PositionType() == POSITION_TYPE_BUY) {
                    if (bid - posinfo.PriceOpen() > TslTriggerPoints * _Point) {
                        double tp = posinfo.TakeProfit();
                        double sl = 0;

                        switch (TrailType) {
                            case 1: sl = bid - (TslPoints * _Point); break;
                            case 2: sl = iLow(_Symbol, PERIOD_CURRENT, PrvCandleN); break;
                            case 3:
                                CopyBuffer(handleTrailMA, MAIN_LINE, 1, 1, indbuffer);
                                ArraySetAsSeries(indbuffer, true);
                                sl = NormalizeDouble(indbuffer[0], _Digits);
                                break;
                            case 4:
                                CopyBuffer(handleIchimoku, TENKANSEN_LINE, 1, 1, indbuffer);
                                ArraySetAsSeries(indbuffer, true);
                                sl = NormalizeDouble(indbuffer[0], _Digits);
                                break;
                        }
                        if (sl > posinfo.StopLoss() && sl > posinfo.PriceOpen() && sl < bid) {
                            trade.PositionModify(ticket, sl, tp);
                        }
                    }
                } else if (posinfo.PositionType() == POSITION_TYPE_SELL) {
                    if (ask + (TslTriggerPoints * _Point) < posinfo.PriceOpen()) {
                        double tp = posinfo.TakeProfit();
                        double sl = 0;

                        switch (TrailType) {
                            case 1: sl = ask + (TslPoints * _Point); break;
                            case 2: sl = iHigh(_Symbol, PERIOD_CURRENT, PrvCandleN); break;
                            case 3:
                                CopyBuffer(handleTrailMA, MAIN_LINE, 1, 1, indbuffer);
                                ArraySetAsSeries(indbuffer, true);
                                sl = NormalizeDouble(indbuffer[0], _Digits);
                                break;
                            case 4:
                                CopyBuffer(handleIchimoku, TENKANSEN_LINE, 1, 1, indbuffer);
                                ArraySetAsSeries(indbuffer, true);
                                sl = NormalizeDouble(indbuffer[0], _Digits);
                                break;
                        }
                        if (sl < posinfo.StopLoss() && sl < posinfo.PriceOpen() && sl > ask) {
                            trade.PositionModify(ticket, sl, tp);
                        }
                    }
                }
            }
        }
    }
}