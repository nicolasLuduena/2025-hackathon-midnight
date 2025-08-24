import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";

export function AssetOverview() {
  const mockAssets = [
    {
      id: 1,
      name: "Real Estate Token A",
      symbol: "RETA",
      totalShares: 10000,
      availableShares: 2500,
      unitPrice: 125,
      totalValue: 125500,
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      name: "Art Collection B",
      symbol: "ARTB",
      totalShares: 5000,
      availableShares: 750,
      unitPrice: 89,
      totalValue: 446250,
      lastUpdated: "1 hour ago",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mockAssets.map((asset) => (
        <Card key={asset.id} className="relative overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-serif">
                  {asset.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Coins className="w-4 h-4 mr-1" />
                  {asset.symbol}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${asset.unitPrice}</p>
                <p className="text-sm text-muted-foreground">per share</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Shares</span>
                <span>
                  {asset.availableShares.toLocaleString()} /{" "}
                  {asset.totalShares.toLocaleString()}
                </span>
              </div>
              <Progress
                value={(asset.availableShares / asset.totalShares) * 100}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold">
                  ${asset.totalValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 cursor-pointer">Buy Shares</Button>
              <Button
                variant="default"
                className="flex-1 bg-transparent border border-border text-foreground hover:bg-gray-900 focus:bg-gray-900 cursor-pointer"
              >
                Sell Shares
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
