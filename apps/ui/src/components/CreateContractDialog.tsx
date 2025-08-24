import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContractContext } from "@/hooks/useDeployedContract";

interface AssetPublicInfo {
  kind: string;
  description: string;
}

interface CreateContractFormData {
  assetInfo: AssetPublicInfo;
  expectedCoinType: string; // Will be converted to Uint8Array
  unitPrice: string; // Will be converted to bigint
  availableShares: string; // Will be converted to bigint
}

interface CreateContractDialogProps {
  children: React.ReactNode;
  onCreateContract: (data: {
    assetInfo: AssetPublicInfo;
    expectedCoinType: Uint8Array;
    unitPrice: bigint;
    availableShares: bigint;
  }) => void;
}

export function CreateContractDialog({
  children,
  onCreateContract,
}: CreateContractDialogProps) {
  const contractApiProvider = useContractContext();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateContractFormData>({
    assetInfo: {
      kind: "",
      description: "",
    },
    expectedCoinType: "",
    unitPrice: "",
    availableShares: "",
  });

  const onCreate = useCallback(
    () => contractApiProvider.resolve(),
    [contractApiProvider],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const expectedCoinType = new TextEncoder().encode(
        formData.expectedCoinType,
      );
      const unitPrice = BigInt(formData.unitPrice);
      const availableShares = BigInt(formData.availableShares);

      onCreateContract({
        assetInfo: formData.assetInfo,
        expectedCoinType,
        unitPrice,
        availableShares,
      });

      setFormData({
        assetInfo: { kind: "", description: "" },
        expectedCoinType: "",
        unitPrice: "",
        availableShares: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  const updateAssetInfo = (field: keyof AssetPublicInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      assetInfo: {
        ...prev.assetInfo,
        [field]: value,
      },
    }));
  };

  const updateField = (
    field: keyof Omit<CreateContractFormData, "assetInfo">,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new tokenization contract.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="kind">Asset Kind</Label>
              <Input
                id="kind"
                value={formData.assetInfo.kind}
                onChange={(e) => updateAssetInfo("kind", e.target.value)}
                placeholder="e.g., Real Estate, Art, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Asset Description</Label>
              <Textarea
                id="description"
                value={formData.assetInfo.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateAssetInfo("description", e.target.value)
                }
                placeholder="Detailed description of the asset"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coinType">Expected Coin Type</Label>
              <Input
                id="coinType"
                value={formData.expectedCoinType}
                onChange={(e) =>
                  updateField("expectedCoinType", e.target.value)
                }
                placeholder="Coin type identifier"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => updateField("unitPrice", e.target.value)}
                placeholder="Price per share"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availableShares">Available Shares</Label>
              <Input
                id="availableShares"
                type="number"
                value={formData.availableShares}
                onChange={(e) => updateField("availableShares", e.target.value)}
                placeholder="Total number of shares"
                min="1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="default"
              className="bg-transparent border border-border text-foreground hover:bg-red-600 hover:text-white cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              variant="default"
              type="submit"
              onClick={onCreate}
            >
              Create Contract
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
