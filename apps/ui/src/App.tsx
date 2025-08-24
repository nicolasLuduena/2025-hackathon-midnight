import "./globals";
import { TrendingUp, Users, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssetOverview } from "@/components/asset-overview";
import { TradingInterface } from "@/components/trading-interface";
import Header from "./components/Header";
import { useContractContext } from "./hooks/useDeployedContract";
import { useCallback, useEffect, useState } from "react";
import type { Observable } from "rxjs";
import type { ContractDeployment } from "./contexts/browser-contract-manager";
//import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";

export default function ZKTradingDashboard() {
  const boardApiProvider = useContractContext();
  const [boardDeployments, setBoardDeployments] = useState<
    Array<Observable<ContractDeployment>>
  >([]);
  const [contractAddress, setContractAddress] = useState("");

  useEffect(() => {
    const subscription =
      boardApiProvider.boardDeployments$.subscribe(setBoardDeployments);

    return () => {
      subscription.unsubscribe();
    };
  }, [boardApiProvider]);

  console.log(boardDeployments);

  //const deployContract = async () => {};

  const onCreateBoard = useCallback(
    () => boardApiProvider.resolve(),
    [boardApiProvider],
  );

  //const onJoinBoard = useCallback(
  //  (contractAddress: ContractAddress) =>
  //    boardApiProvider.resolve(contractAddress),
  //  [boardApiProvider],
  //);
  const handleAddContract = () => {
    // TODO: Implement add contract functionality
    console.log("Adding contract with address:", contractAddress);
    setContractAddress("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="grid gap-8">
          <Button onClick={onCreateBoard}>HOLAAA</Button>
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  Add Contract
                </h2>
                <p className="text-muted-foreground text-sm">
                  Enter a contract address to monitor
                </p>
              </div>
            </div>
            <div className="flex gap-2 max-w-md">
              <Input
                type="text"
                placeholder="Enter contract address..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddContract}
                disabled={!contractAddress.trim()}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Asset Overview
                </h2>
                <p className="text-muted-foreground">
                  Monitor your tokenized assets and market activity
                </p>
              </div>
            </div>
            <AssetOverview />
          </section>
          <Separator />

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Trading Interface
              </h2>
              <p className="text-muted-foreground">
                Execute zero-knowledge transactions with complete privacy
              </p>
            </div>
            <TradingInterface />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assets
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,345</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Shares
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  Across 5 different assets
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
