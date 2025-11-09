import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Candle } from "@/types/market";

interface CandlestickChartProps {
  candles: Candle[];
  height?: number;
}

export const CandlestickChart = ({ candles, height = 400 }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a", // Gray text to match app
      },
      grid: {
        vertLines: { visible: false }, // Remove vertical grid lines
        horzLines: { visible: false }, // Remove horizontal grid lines
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#71717a",
          width: 1,
          style: 3, // Dashed line
          labelBackgroundColor: "#27272a",
        },
        horzLine: {
          color: "#71717a",
          width: 1,
          style: 3, // Dashed line
          labelBackgroundColor: "#27272a",
        },
      },
      rightPriceScale: {
        borderColor: "#27272a",
        borderVisible: true,
      },
      timeScale: {
        borderColor: "#27272a",
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chart.remove();
      }
    };
  }, [height]);

  // Update candles
  useEffect(() => {
    if (!candlestickSeriesRef.current || candles.length === 0) return;

    const formattedCandles: CandlestickData[] = candles.map((candle) => ({
      time: candle.time as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeriesRef.current.setData(formattedCandles);

    // Fit content to view
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  return <div ref={chartContainerRef} className="w-full" />;
};
