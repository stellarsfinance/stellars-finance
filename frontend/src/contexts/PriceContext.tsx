import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { createTickerStream } from "@/services/binance";
import { TRADING_PAIRS } from "@/types/market";

interface PriceData {
  price: number;
  change24h: number;
}

interface PriceContextType {
  prices: Map<string, PriceData>;
  getPrice: (symbol: string) => PriceData | null;
  isConnected: boolean;
}

const PriceContext = createContext<PriceContextType>({
  prices: new Map(),
  getPrice: () => null,
  isConnected: false,
});

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("usePrices must be used within PriceProvider");
  }
  return context;
};

interface PriceProviderProps {
  children: ReactNode;
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const symbols = TRADING_PAIRS.map((pair) => pair.symbol);

    const ws = createTickerStream(
      symbols,
      (symbol, price, change24h) => {
        setPrices((prev) => {
          const newPrices = new Map(prev);
          newPrices.set(symbol, { price, change24h });
          return newPrices;
        });
      }
    );

    ws.onopen = () => {
      console.log("Price WebSocket connected");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("Price WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getPrice = (symbol: string): PriceData | null => {
    return prices.get(symbol) || null;
  };

  const value: PriceContextType = {
    prices,
    getPrice,
    isConnected,
  };

  return <PriceContext.Provider value={value}>{children}</PriceContext.Provider>;
};
