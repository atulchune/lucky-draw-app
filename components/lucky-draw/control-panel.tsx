'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Undo2, Download, Eye, EyeOff } from 'lucide-react';

interface ControlPanelProps {
  onReset: () => void;
  onUndo?: () => void;
  onExport?: () => void;
  onRevealAll?: () => void;
  onHideAll?: () => void;
  canUndo?: boolean;
  allRevealed?: boolean;
  disableActions?: boolean;
}

export function ControlPanel({
  onReset,
  onUndo,
  onExport,
  onRevealAll,
  onHideAll,
  canUndo = false,
  allRevealed = false,
  disableActions = false,
}: ControlPanelProps) {
  return (
    <Card className="w-full p-6 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Button
          onClick={onRevealAll}
          disabled={disableActions || allRevealed}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden md:inline">Reveal All</span>
        </Button>

        <Button
          onClick={onHideAll}
          disabled={disableActions || !allRevealed}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <EyeOff className="w-4 h-4" />
          <span className="hidden md:inline">Hide All</span>
        </Button>

        <Button
          onClick={onUndo}
          disabled={disableActions || !canUndo}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden md:inline">Undo</span>
        </Button>

        <Button
          onClick={onExport}
          disabled={disableActions}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </Button>

        <Button
          onClick={onReset}
          disabled={disableActions}
          variant="destructive"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Reset</span>
        </Button>
      </div>
    </Card>
  );
}
