import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Header from "@/components/Header";
import { usePrices } from "@/contexts/PriceContext";
import { TRADING_PAIRS } from "@/types/market";
import { SparklineChart } from "@/components/SparklineChart";

const Home = () => {
  const { getPrice, isConnected } = usePrices();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Perpetual Markets</h1>
          <p className="text-muted-foreground text-lg">
            Trade crypto futures with up to 50x leverage
            {!isConnected && (
              <span className="ml-2 text-sm">(Connecting to live prices...)</span>
            )}
          </p>
        </div>

        {/* Market Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRADING_PAIRS.map((pair) => {
            const priceData = getPrice(pair.symbol);
            const price = priceData?.price || 0;
            const change24h = priceData?.change24h || 0;
            const isPositive = change24h >= 0;

            return (
              <Link key={pair.displaySymbol} to={`/trade/${pair.displaySymbol}`}>
                <Card className="card-elevated cursor-pointer border-border">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{pair.displaySymbol}</h3>
                        <p className="text-sm text-muted-foreground">{pair.name}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                          isPositive
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {Math.abs(change24h).toFixed(2)}%
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {price > 0 ? (
                        <div className="text-2xl font-bold tabular-nums">
                          ${price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      ) : (
                        <div className="h-8 w-32 bg-secondary animate-pulse rounded"></div>
                      )}
                    </div>

                    {/* Sparkline */}
                    <div className="mb-4 h-12 flex items-center">
                      <SparklineChart
                        width={180}
                        height={40}
                        positive={isPositive}
                        className={isPositive ? "text-success opacity-70" : "text-danger opacity-70"}
                      />
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-0.5">24h Volume</div>
                        <div className="font-medium">-</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-0.5">Open Interest</div>
                        <div className="font-medium">-</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
