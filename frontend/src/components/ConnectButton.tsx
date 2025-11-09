import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export const ConnectButton = () => {
  const { connectWallet, isConnected, isLoading } = useWallet();

  if (isLoading) {
    return (
      <Button disabled className="bg-blue-600 hover:bg-blue-700">
        Loading...
      </Button>
    );
  }

  if (isConnected) {
    return null;
  }

  return (
    <Button
      onClick={connectWallet}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
    >
      Connect Wallet
    </Button>
  );
};
