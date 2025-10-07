import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SummaryMode = "short" | "detailed" | "plain";

interface SummaryOptionsProps {
  mode: SummaryMode;
  onModeChange: (mode: SummaryMode) => void;
}

export const SummaryOptions = ({ mode, onModeChange }: SummaryOptionsProps) => {
  return (
    <Card className="p-6 shadow-elegant">
      <div className="space-y-2">
        <Label htmlFor="summary-mode" className="text-base font-medium">
          Summary Mode
        </Label>
        <Select value={mode} onValueChange={(value) => onModeChange(value as SummaryMode)}>
          <SelectTrigger id="summary-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="short">
              <div className="py-1">
                <p className="font-medium">Short Summary</p>
                <p className="text-sm text-muted-foreground">
                  Key points and essential information only
                </p>
              </div>
            </SelectItem>
            <SelectItem value="detailed">
              <div className="py-1">
                <p className="font-medium">Detailed Summary</p>
                <p className="text-sm text-muted-foreground">
                  Comprehensive overview with important details
                </p>
              </div>
            </SelectItem>
            <SelectItem value="plain">
              <div className="py-1">
                <p className="font-medium">Plain English Summary</p>
                <p className="text-sm text-muted-foreground">
                  Simplified language for easy understanding
                </p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
