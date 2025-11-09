import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isTradePage = location.pathname.startsWith("/trade");
  const isVaultPage = location.pathname === "/vault";
  const isFaucetPage = location.pathname === "/faucet";
  const { publicKey, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();

  const truncatedAddress = publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "";

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Stellars Finance</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${isHomePage
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            Markets
          </Link>
          <Link
            to="/trade/BTC-USD"
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${isTradePage
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            Trade
          </Link>
          <Link
            to="/vault"
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${isVaultPage
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            Vault
          </Link>
          <Link
            to="/faucet"
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${isFaucetPage
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
          >
            Faucet
          </Link>
        </nav>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-md border border-border">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm font-mono hidden sm:inline">{truncatedAddress}</span>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={connectWallet} disabled={isLoading} className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{isLoading ? "Loading..." : "Connect Wallet"}</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
