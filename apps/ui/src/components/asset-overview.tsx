import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Coins, TrendingUp, Clock, Shield } from "lucide-react"

export function AssetOverview() {
  const mockAssets = [
    {
      id: 1,
      name: "Real Estate Token A",
      symbol: "RETA",
      totalShares: 10000,
      availableShares: 2500,
      unitPrice: 125.5,
      totalValue: 1255000,
      priceChange: 2.5,
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      name: "Art Collection B",
      symbol: "ARTB",
      totalShares: 5000,
      availableShares: 750,
      unitPrice: 89.25,
      totalValue: 446250,
      priceChange: -1.2,
      lastUpdated: "1 hour ago",
    },
  ]

  return (
    <div className="grid gap-6">
      {mockAssets.map((asset) => (
        <Card key={asset.id} className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              ZK Verified
            </Badge>
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-serif">{asset.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Coins className="w-4 h-4 mr-1" />
                  {asset.symbol}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price and Change */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${asset.unitPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">per share</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center ${asset.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {asset.priceChange >= 0 ? "+" : ""}
                  {asset.priceChange}%
                </div>
                <p className="text-sm text-muted-foreground">24h change</p>
              </div>
            </div>

            {/* Share Availability */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Shares</span>
                <span>
                  {asset.availableShares.toLocaleString()} / {asset.totalShares.toLocaleString()}
                </span>
              </div>
              <Progress value={(asset.availableShares / asset.totalShares) * 100} className="h-2" />
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold">${asset.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {asset.lastUpdated}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1">Buy Shares</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Sell Shares
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
