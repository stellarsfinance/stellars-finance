import { Candle, BinanceKline, TimeFrame } from "@/types/market";

const BINANCE_REST_API = "https://api.binance.com/api/v3";
const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";

/**
 * Fetch historical candlestick data from Binance REST API
 */
export const fetchCandles = async (
  symbol: string,
  interval: TimeFrame,
  limit: number = 500
): Promise<Candle[]> => {
  try {
    const response = await fetch(
      `${BINANCE_REST_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((kline: any) => ({
      time: kline[0] / 1000, // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error("Error fetching candles:", error);
    throw error;
  }
};

/**
 * Fetch 24h ticker data from Binance REST API
 */
export const fetch24hTicker = async (symbol: string) => {
  try {
    const response = await fetch(
      `${BINANCE_REST_API}/ticker/24hr?symbol=${symbol}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
    };
  } catch (error) {
    console.error("Error fetching ticker:", error);
    throw error;
  }
};

/**
 * Create WebSocket connection for candlestick stream
 */
export const createCandlestickStream = (
  symbol: string,
  interval: TimeFrame,
  onCandle: (candle: Candle) => void
): WebSocket => {
  const ws = new WebSocket(
    `${BINANCE_WS_BASE}/${symbol.toLowerCase()}@kline_${interval}`
  );

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const kline: BinanceKline = message.k;

    const candle: Candle = {
      time: kline.t / 1000, // Convert to seconds
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
    };

    onCandle(candle);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
};

/**
 * Create WebSocket connection for price ticker stream
 */
export const createTickerStream = (
  symbols: string[],
  onTicker: (symbol: string, price: number, change24h: number) => void
): WebSocket => {
  const streams = symbols
    .map((s) => `${s.toLowerCase()}@ticker`)
    .join("/");

  const ws = new WebSocket(`${BINANCE_WS_BASE}/${streams}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    onTicker(
      data.s,
      parseFloat(data.c),
      parseFloat(data.P)
    );
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
};
