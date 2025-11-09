import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useOpenPosition, useUserTokenBalance } from "@/hooks/usePositionManager";
import { useWallet } from "@/hooks/useWallet";
import { MarketId } from "@/services/positionManager";
import { Loader2 } from "lucide-react";

interface TradePanelProps {
  asset: string;
  currentPrice: number;
}

const TradePanel = ({ asset, currentPrice }: TradePanelProps) => {
  const { publicKey } = useWallet();
  const openPositionMutation = useOpenPosition();
  const { data: tokenBalance } = useUserTokenBalance();

  const [position, setPosition] = useState<"long" | "short">("long");
  const [collateral, setCollateral] = useState("");
  const [leverage, setLeverage] = useState([10]);

  const calculatePositionSize = () => {
    const collateralAmount = parseFloat(collateral) || 0;
    return collateralAmount * leverage[0];
  };

  const calculateLiquidationPrice = () => {
    const collateralAmount = parseFloat(collateral) || 0;
    if (collateralAmount === 0) return 0;

    const maintenanceMargin = 0.5; // 0.5% maintenance margin

    if (position === "long") {
      return currentPrice * (1 - (1 / leverage[0]) + (maintenanceMargin / 100));
    } else {
      return currentPrice * (1 + (1 / leverage[0]) - (maintenanceMargin / 100));
    }
  };

  const handleTrade = async (positionType: "long" | "short") => {
    // Update position state for loading indicator
    setPosition(positionType);

    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!collateral || parseFloat(collateral) <= 0) {
      toast.error("Please enter a valid collateral amount");
      return;
    }

    const collateralAmount = parseFloat(collateral);

    // Check if user has enough balance
    if (tokenBalance && collateralAmount > tokenBalance.formatted) {
      toast.error("Insufficient balance", {
        description: `You have ${tokenBalance.formatted.toFixed(2)} USD available`,
      });
      return;
    }

    // Validate leverage (contract enforces 5-20x)
    if (leverage[0] < 5 || leverage[0] > 20) {
      toast.error("Leverage must be between 5x and 20x");
      return;
    }

    // Open position via contract
    openPositionMutation.mutate(
      {
        marketId: MarketId.XLM_PERP, // For MVP, always XLM-PERP (fixed $1 price)
        collateral: collateralAmount,
        leverage: leverage[0],
        isLong: positionType === "long",
      },
      {
        onSuccess: () => {
          // Clear form on success
          setCollateral("");
          setLeverage([10]);
        },
      }
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Open Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-secondary rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Market Price</div>
          <div className="text-xl font-bold">${currentPrice.toLocaleString()}</div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="collateral">Collateral (USD)</Label>
            {tokenBalance && (
              <span className="text-xs text-muted-foreground">
                Balance: ${tokenBalance.formatted.toFixed(2)}
              </span>
            )}
          </div>
          <Input
            id="collateral"
            type="number"
            placeholder="0.00"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            disabled={openPositionMutation.isPending}
          />
          {tokenBalance && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-xs"
              onClick={() => setCollateral(tokenBalance.formatted.toString())}
              disabled={openPositionMutation.isPending}
            >
              Max
            </Button>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label>Leverage</Label>
            <span className="text-sm font-medium">{leverage[0]}x</span>
          </div>
          <Slider
            value={leverage}
            onValueChange={setLeverage}
            min={5}
            max={20}
            step={1}
            className="mb-2"
            disabled={openPositionMutation.isPending}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5x</span>
            <span>20x (Max)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Contract enforces 5-20x leverage range
          </p>
        </div>

        <div className="space-y-2 p-4 bg-secondary rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Position Size</span>
            <span className="font-medium">{calculatePositionSize().toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-medium">${currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Liquidation Price</span>
            <span className="font-medium text-danger">
              ${calculateLiquidationPrice().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleTrade("long")}
            className="bg-success hover:bg-success/90 text-success-foreground"
            disabled={!publicKey || openPositionMutation.isPending}
          >
            {openPositionMutation.isPending && position === "long" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Opening...
              </>
            ) : (
              "Long"
            )}
          </Button>
          <Button
            onClick={() => handleTrade("short")}
            className="bg-danger hover:bg-danger/90 text-danger-foreground"
            disabled={!publicKey || openPositionMutation.isPending}
          >
            {openPositionMutation.isPending && position === "short" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Opening...
              </>
            ) : (
              "Short"
            )}
          </Button>
        </div>
        {!publicKey && (
          <p className="text-sm text-center text-muted-foreground">
            Connect wallet to trade
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TradePanel;
