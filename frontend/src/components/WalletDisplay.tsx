import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export const WalletDisplay = () => {
  const { publicKey, isConnected, disconnectWallet } = useWallet();

  if (!isConnected || !publicKey) {
    return null;
  }

  const truncatedAddress = `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;

  return (
    <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-mono text-slate-200">{truncatedAddress}</span>
      </div>
      <Button
        onClick={disconnectWallet}
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-white hover:bg-slate-700"
      >
        Disconnect
      </Button>
    </div>
  );
};
