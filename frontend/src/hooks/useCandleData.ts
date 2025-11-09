import { useState, useEffect, useRef } from "react";
import { fetchCandles, createCandlestickStream } from "@/services/binance";
import { Candle, TimeFrame } from "@/types/market";

export const useCandleData = (symbol: string, interval: TimeFrame) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCandles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch historical candles
        const historicalCandles = await fetchCandles(symbol, interval, 500);

        if (mounted) {
          setCandles(historicalCandles);
          setIsLoading(false);
        }

        // Connect to WebSocket for real-time updates
        if (wsRef.current) {
          wsRef.current.close();
        }

        wsRef.current = createCandlestickStream(symbol, interval, (newCandle) => {
          if (!mounted) return;

          setCandles((prevCandles) => {
            const lastCandle = prevCandles[prevCandles.length - 1];

            // Update existing candle or add new one
            if (lastCandle && lastCandle.time === newCandle.time) {
              // Update the last candle
              return [...prevCandles.slice(0, -1), newCandle];
            } else {
              // New candle, add to array
              return [...prevCandles, newCandle];
            }
          });
        });
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load candles");
          setIsLoading(false);
        }
      }
    };

    loadCandles();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, interval]);

  return { candles, isLoading, error };
};
