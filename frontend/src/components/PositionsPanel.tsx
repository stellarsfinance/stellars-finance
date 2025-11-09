import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useUserPositions, useClosePosition } from "@/hooks/usePositionManager";
import { useWallet } from "@/hooks/useWallet";

// Map market IDs to asset names (for MVP with fixed $1 price, asset display is mostly for UX)
const MARKET_NAMES: Record<number, string> = {
  0: "XLM-PERP",
  1: "BTC-PERP",
  2: "ETH-PERP",
};

const PositionsPanel = () => {
  const { publicKey } = useWallet();
  const { data: positions = [], isLoading, isError } = useUserPositions();
  const closePositionMutation = useClosePosition();

  const handleClosePosition = (positionId: bigint) => {
    closePositionMutation.mutate(positionId);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Open Positions</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions" className="mt-4">
            <div className="space-y-4">
              {!publicKey ? (
                <div className="text-center py-12 text-muted-foreground">
                  Connect wallet to view positions
                </div>
              ) : isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="text-center py-12 text-danger">
                  Error loading positions
                </div>
              ) : positions.length > 0 ? (
                positions.map((position) => (
                  <div
                    key={position.id.toString()}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {MARKET_NAMES[0] || "UNKNOWN"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            position.isLong
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {position.isLong ? "LONG" : "SHORT"} {position.leverage.toFixed(1)}x
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClosePosition(position.id)}
                        disabled={closePositionMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Size</div>
                        <div className="font-medium">${position.size.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Collateral</div>
                        <div className="font-medium">${position.collateral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Entry Price</div>
                        <div className="font-medium">${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Liquidation</div>
                        <div className="font-medium text-danger">
                          ${position.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          PnL:
                        </span>
                        <span className="font-semibold text-muted-foreground">
                          {" "}$0.00 (0.00%)
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          (MVP: fixed price)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePosition(position.id)}
                        disabled={closePositionMutation.isPending}
                      >
                        {closePositionMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Closing...
                          </>
                        ) : (
                          "Close Position"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No open positions
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-3">
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Trade history not yet implemented</p>
                <p className="text-sm">
                  Requires event indexing or backend service to track closed positions
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PositionsPanel;
