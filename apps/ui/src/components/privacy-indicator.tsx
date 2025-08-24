import { Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function PrivacyIndicator() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Shield className="w-4 h-4 text-primary mr-1" />
          <span className="text-sm font-medium">Privacy: ON</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Zero-Knowledge Privacy</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Transaction Privacy</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Protected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Identity Shielding</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Nullifier System</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Enabled
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Your transactions are cryptographically private using zero-knowledge proofs. Only you can see your trading
              activity and balances.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
