"use client";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, Shield, Lock, ChevronDown, User, LogOut } from "lucide-react";
import { CreateContractDialog } from "./CreateContractDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { connect, disconnect, isConnected, isConnecting, error, state } =
    useWallet();

  const handleCreateContract = (data: {
    assetInfo: { kind: string; description: string };
    expectedCoinType: Uint8Array;
    unitPrice: bigint;
    availableShares: bigint;
  }) => {
    console.log("Creating contract with data:", data);
    // TODO: Implement actual contract creation logic
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                Oz Trades
              </h1>
              <p className="text-sm text-muted-foreground">
                Tokenization Trading
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {error && (
              <div className="text-destructive text-sm p-2 border border-destructive/20 rounded bg-destructive/10">
                {error}
              </div>
            )}
            {!isConnected ? (
              <Button
                variant="default"
                className="cursor-pointer transition-colors hover:bg-green-600 bg-green-500"
                onClick={connect}
                disabled={isConnecting}
                style={{ opacity: isConnecting ? 0.5 : 1 }}
              >
                {isConnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isConnecting ? (
                  "Connecting..."
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Connect wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-4 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="bg-transparent border border-border text-foreground hover:bg-white hover:text-black cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {state?.address
                          ? `${state.address.slice(0, 6)}...${state.address.slice(-6)}`
                          : "Connected"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Wallet Info</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={disconnect}
                      className="text-red-600 focus:text-red-600 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <CreateContractDialog onCreateContract={handleCreateContract}>
                  <Button variant="default" className="cursor-pointer">
                    Create Contract
                  </Button>
                </CreateContractDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
