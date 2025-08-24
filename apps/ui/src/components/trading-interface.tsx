import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Coins,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function TradingInterface() {
  const [selectedAsset, setSelectedAsset] = useState("");
  const [amount, setAmount] = useState("");
  // const [price, setPrice] = useState("")

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <Tabs defaultValue="mint" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mint">Mint Shares</TabsTrigger>
            <TabsTrigger value="sell">Sell Shares</TabsTrigger>
            <TabsTrigger value="buy">Buy Shares</TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Mint New Shares
                </CardTitle>
                <CardDescription>
                  Purchase shares directly from the asset pool with
                  zero-knowledge privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-asset">Select Asset</Label>
                  <Select
                    value={selectedAsset}
                    onValueChange={setSelectedAsset}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an asset to mint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reta">
                        Real Estate Token A (RETA)
                      </SelectItem>
                      <SelectItem value="artb">
                        Art Collection B (ARTB)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mint-amount">Amount of Shares</Label>
                    <Input
                      id="mint-amount"
                      placeholder="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mint-total">Total Cost</Label>
                    <Input
                      id="mint-total"
                      placeholder="$12,550"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">
                    Zero-knowledge proof will be generated
                  </span>
                </div>

                <Button className="w-full" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Mint Shares
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sell" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Create Sell Offer
                </CardTitle>
                <CardDescription>
                  List your shares for sale with privacy-preserving nullifiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-asset">Your Assets</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shares to sell" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reta-owned">
                        RETA - 250 shares owned
                      </SelectItem>
                      <SelectItem value="artb-owned">
                        ARTB - 100 shares owned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-amount">Shares to Sell</Label>
                    <Input id="sell-amount" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sell-price">Price per Share</Label>
                    <Input id="sell-price" placeholder="$125.50" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <AlertCircle className="w-4 h-4 text-accent" />
                  <span className="text-sm text-accent">
                    Your identity will remain private via nullifiers
                  </span>
                </div>

                <Button className="w-full" size="lg" variant="secondary">
                  Create Sell Offer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy from Offers
                </CardTitle>
                <CardDescription>
                  Purchase shares from existing private offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Offers</Label>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">RETA - 100 shares</p>
                          <p className="text-sm text-muted-foreground">
                            Anonymous Seller
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">$125.00/share</p>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-2 h-2 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">ARTB - 25 shares</p>
                          <p className="text-sm text-muted-foreground">
                            Anonymous Seller
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">$89.00/share</p>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-2 h-2 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy-amount">Shares to Buy</Label>
                    <Input id="buy-amount" placeholder="25" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buy-total">Total Cost</Label>
                    <Input
                      id="buy-total"
                      placeholder="$3,125"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Buy Shares
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your private transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Minted RETA</p>
                    <p className="text-sm text-muted-foreground">50 shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$6,275</p>
                  <p className="text-xs text-muted-foreground">2h ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Sold ARTB</p>
                    <p className="text-sm text-muted-foreground">25 shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,225</p>
                  <p className="text-xs text-muted-foreground">1d ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
