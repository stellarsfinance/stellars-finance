import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import {
  usePoolStats,
  useDeposit,
  useWithdraw,
  useUserShares,
  useTotalShares,
  useTotalDeposits,
  useUserTokenBalance,
  useUserShareValue,
} from "@/hooks/useLiquidityPool";

// Placeholder token price - in production, fetch from oracle or price feed
const TOKEN_PRICE = 1.25; // Token price in USD

const Vault = () => {
  const { publicKey, isConnected, connectWallet } = useWallet();
  const [stakeInput, setStakeInput] = useState("");
  const [unstakeInput, setUnstakeInput] = useState("");

  // Fetch pool data using TanStack Query hooks
  const poolStats = usePoolStats();
  const depositMutation = useDeposit();
  const withdrawMutation = useWithdraw();

  // Calculate pool share percentage
  const poolShare = poolStats.totalShares > 0
    ? (poolStats.userShares / poolStats.totalShares) * 100
    : 0;

  // Calculate position value
  const positionValue = poolStats.userShareValue * TOKEN_PRICE;

  const handleStake = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(stakeInput);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > poolStats.userTokenBalance) {
      toast.error("Insufficient token balance");
      return;
    }

    try {
      await depositMutation.mutateAsync(amount);
      setStakeInput("");
      toast.success(`Successfully deposited ${amount.toLocaleString()} tokens`);
    } catch (error: any) {
      console.error("Deposit error:", error);
      // Check if user rejected the transaction
      if (error.message?.includes('User declined')) {
        toast.error("Transaction cancelled");
      } else {
        toast.error(`Failed to deposit: ${error.message || "Unknown error"}`);
      }
    }
  };

  const handleUnstake = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(unstakeInput);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > poolStats.userShares) {
      toast.error("Insufficient LP shares");
      return;
    }

    try {
      await withdrawMutation.mutateAsync(amount);
      setUnstakeInput("");
      toast.success(`Successfully withdrew ${amount.toLocaleString()} shares`);
    } catch (error: any) {
      console.error("Withdraw error:", error);
      // Check if user rejected the transaction
      if (error.message?.includes('User declined')) {
        toast.error("Transaction cancelled");
      } else {
        toast.error(`Failed to withdraw: ${error.message || "Unknown error"}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Liquidity Vault
            </h1>
            <p className="text-muted-foreground">
              Stake your tokens to earn rewards and participate in the liquidity pool
            </p>
          </div>

          {/* Pool Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Position</CardTitle>
              <CardDescription>
                {!isConnected ? "Connect your wallet to view your position" : "Current staking position and pool share"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your position</p>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : poolStats.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading pool data...</span>
                </div>
              ) : poolStats.isError ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error loading pool data. Please try again.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">LP Shares</div>
                      <div className="text-2xl font-bold">
                        {poolStats.userShares.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Pool Share</div>
                      <div className="text-2xl font-bold text-primary">
                        {poolShare.toFixed(3)}%
                      </div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Position Value</div>
                      <div className="text-2xl font-bold">
                        ${positionValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Pool Deposits</span>
                      <span className="font-medium">
                        {poolStats.totalDeposits.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} tokens
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Your Share Value</span>
                      <span className="font-medium">
                        {poolStats.userShareValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} tokens
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Token Price</span>
                      <span className="font-medium">${TOKEN_PRICE.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stake/Unstake */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Position</CardTitle>
              <CardDescription>Stake or unstake your tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stake" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stake">Stake</TabsTrigger>
                  <TabsTrigger value="unstake">Unstake</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stake" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="stake-amount">Amount to Deposit</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0.00"
                      value={stakeInput}
                      onChange={(e) => setStakeInput(e.target.value)}
                      disabled={!isConnected || depositMutation.isPending}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {isConnected ? (
                        poolStats.isLoading ? (
                          "Loading balance..."
                        ) : (
                          `Available: ${poolStats.userTokenBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} tokens`
                        )
                      ) : (
                        "Connect wallet to see balance"
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={isConnected ? handleStake : connectWallet}
                    className="w-full gap-2"
                    disabled={depositMutation.isPending || poolStats.isLoading}
                  >
                    {depositMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isConnected ? (
                      <>
                        <ArrowDownToLine className="h-4 w-4" />
                        Deposit Tokens
                      </>
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="unstake" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="unstake-amount">LP Shares to Withdraw</Label>
                    <Input
                      id="unstake-amount"
                      type="number"
                      placeholder="0.00"
                      value={unstakeInput}
                      onChange={(e) => setUnstakeInput(e.target.value)}
                      disabled={!isConnected || withdrawMutation.isPending}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {isConnected ? (
                        poolStats.isLoading ? (
                          "Loading shares..."
                        ) : (
                          `LP Shares: ${poolStats.userShares.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        )
                      ) : (
                        "Connect wallet to see shares"
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={isConnected ? handleUnstake : connectWallet}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={withdrawMutation.isPending || poolStats.isLoading}
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isConnected ? (
                      <>
                        <ArrowUpFromLine className="h-4 w-4" />
                        Withdraw Shares
                      </>
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Vault;
