import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Loader2, Droplets, Wallet, Info } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useTokenBalance, useTokenInfo, useMintTokens } from "@/hooks/useFaucet";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Faucet = () => {
  const { publicKey, isConnected, connectWallet } = useWallet();
  const [mintAmount, setMintAmount] = useState("");

  // Fetch data using TanStack Query hooks
  const tokenInfo = useTokenInfo();
  const tokenBalance = useTokenBalance();
  const mintMutation = useMintTokens();

  // Preset amounts for quick minting
  const presetAmounts = [100, 500, 1000, 5000];

  const handleMint = async (amount?: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amountToMint = amount || parseFloat(mintAmount);
    if (!amountToMint || amountToMint <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await mintMutation.mutateAsync(amountToMint);
      setMintAmount("");
      toast.success(`Successfully minted ${amountToMint.toLocaleString()} tokens!`);
    } catch (error: any) {
      console.error("Mint error:", error);
      // Check if user rejected the transaction
      if (error.message?.includes('User declined')) {
        toast.error("Transaction cancelled");
      } else {
        toast.error(`Failed to mint tokens: ${error.message || "Unknown error"}`);
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
              <Droplets className="h-8 w-8 text-blue-500" />
              Token Faucet
            </h1>
            <p className="text-muted-foreground">
              Get free test tokens for the Stellar testnet
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This faucet provides test tokens for the Stellar testnet. These tokens have no real value and are only for testing purposes.
            </AlertDescription>
          </Alert>

          {/* Token Info */}
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>Details about the test token</CardDescription>
            </CardHeader>
            <CardContent>
              {tokenInfo.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading token info...</span>
                </div>
              ) : tokenInfo.isError ? (
                <div className="text-destructive">Error loading token information</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Name:</span>
                    <span className="font-medium">{tokenInfo.data?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium">{tokenInfo.data?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decimals:</span>
                    <span className="font-medium">{tokenInfo.data?.decimals}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
              <CardDescription>
                {!isConnected ? "Connect your wallet to view balance" : "Current token balance"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your balance</p>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : tokenBalance.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading balance...</span>
                </div>
              ) : tokenBalance.isError ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error loading balance. Please try again.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">
                    {tokenBalance.data?.formatted.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {tokenInfo.data?.symbol || 'tokens'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mint Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mint Tokens</CardTitle>
              <CardDescription>Request test tokens to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Mint Buttons */}
              <div>
                <Label className="mb-2 block">Quick Mint</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleMint(amount)}
                      disabled={!isConnected || mintMutation.isPending}
                      className="w-full"
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm text-muted-foreground">or custom amount</span>
                  <div className="h-px bg-border flex-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="mint-amount">Amount to Mint</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={!isConnected || mintMutation.isPending}
                />
              </div>

              <Button
                onClick={() => handleMint()}
                className="w-full gap-2"
                disabled={!isConnected || mintMutation.isPending || !mintAmount}
              >
                {mintMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : isConnected ? (
                  <>
                    <Droplets className="h-4 w-4" />
                    Mint Tokens
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Faucet;
