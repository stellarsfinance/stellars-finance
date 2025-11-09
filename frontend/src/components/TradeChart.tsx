import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CandlestickChart } from "./CandlestickChart";
import { useCandleData } from "@/hooks/useCandleData";
import { TimeFrame } from "@/types/market";
import { usePrices } from "@/contexts/PriceContext";

interface TradeChartProps {
  symbol: string;
}

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

const TradeChart = ({ symbol }: TradeChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1h");
  const { candles, isLoading, error } = useCandleData(symbol, timeframe);
  const { getPrice } = usePrices();

  const priceData = getPrice(symbol);
  const currentPrice = priceData?.price || 0;
  const priceChangePercent = priceData?.change24h || 0;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold">
              ${currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`text-sm font-medium ${
                priceChangePercent >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {priceChangePercent >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}% (24h)
            </div>
          </div>
          <div className="flex gap-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeframe === tf.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-accent"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        ) : error ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-danger">Error loading chart: {error}</div>
          </div>
        ) : (
          <CandlestickChart candles={candles} height={400} />
        )}
      </CardContent>
    </Card>
  );
};

export default TradeChart;
