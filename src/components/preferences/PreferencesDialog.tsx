
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreferencesForm } from "./PreferencesForm";
import type { Sport } from "@/types/venue";

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sports: Sport[];
}

export function PreferencesDialog({ open, onOpenChange, sports }: PreferencesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Your Preferences</DialogTitle>
        </DialogHeader>
        <PreferencesForm 
          sports={sports} 
          onComplete={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
