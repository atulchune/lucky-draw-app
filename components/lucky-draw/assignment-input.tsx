'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AssignmentInputProps {
  onAssign: (assignments: Record<string, number>) => void;
  maxPosition: number;
  playerNames: string[];
  usedPositions: Set<number>;
  disabled?: boolean;
}

export function AssignmentInput({
  onAssign,
  maxPosition,
  playerNames,
  usedPositions,
  disabled = false,
}: AssignmentInputProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const handleInputChange = (playerName: string, value: string) => {
    setAssignments((prev) => ({
      ...prev,
      [playerName]: value,
    }));
    setError('');
  };

  const handleAssign = () => {
    const numAssignments: Record<string, number> = {};
    let hasError = false;

    for (const playerName of playerNames) {
      const value = assignments[playerName] || '';
      if (!value) {
        setError(`Please enter a position for ${playerName}`);
        hasError = true;
        break;
      }

      const position = parseInt(value, 10);
      if (isNaN(position) || position < 1 || position > maxPosition) {
        setError(`Invalid position for ${playerName}. Must be between 1 and ${maxPosition}`);
        hasError = true;
        break;
      }

      if (numAssignments[position] !== undefined) {
        setError(`Duplicate position: ${position} is already assigned`);
        hasError = true;
        break;
      }

      numAssignments[playerName] = position;
    }

    if (!hasError) {
      onAssign(numAssignments);
      setAssignments({});
    }
  };

  return (
    <Card className="w-full p-6 shadow-lg">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Manual Assignment</h3>
      <div className="space-y-3">
        {playerNames.map((playerName) => (
          <div key={playerName} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor={`input-${playerName}`} className="text-sm text-slate-600">
                {playerName}
              </Label>
              <Input
                id={`input-${playerName}`}
                type="number"
                min="1"
                max={maxPosition}
                value={assignments[playerName] || ''}
                onChange={(e) => handleInputChange(playerName, e.target.value)}
                placeholder="Enter position"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange(playerName, '')}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button onClick={handleAssign} disabled={disabled} className="w-full">
          Assign Positions
        </Button>
      </div>
    </Card>
  );
}
