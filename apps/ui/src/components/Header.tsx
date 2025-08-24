"use client";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Loader2 } from "lucide-react";

export default function Header() {
  const { connect, disconnect, isConnected, isConnecting, error, state } =
    useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="flex justify-between items-center w-full h-16 px-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Midnight DApp</h1>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <div className="text-destructive text-sm p-2 border border-destructive/20 rounded bg-destructive/10">
              {error}
            </div>
          )}

          {!isConnected ? (
            <Button
              variant="default"
              className="cursor-pointer transition-opacity"
              onClick={connect}
              disabled={isConnecting}
              style={{ opacity: isConnecting ? 0.7 : 1 }}
            >
              {isConnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isConnecting ? "Connecting..." : "Connect wallet"}
            </Button>
          ) : (
            <div className="flex gap-4 items-center">
              <span className="text-green-500 text-sm">
                ✓{" "}
                {state?.address
                  ? `${state.address.slice(0, 6)}...${state.address.slice(-6)}`
                  : "Connected"}
              </span>
              <Button
                variant="outline"
                className="px-5 cursor-pointer transition-opacity"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
