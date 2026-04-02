'use client';

import { Card } from '@/components/ui/card';

interface AssignmentTableProps {
  assignments: Record<string, number>;
}

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  const sortedAssignments = Object.entries(assignments).sort((a, b) => a[1] - b[1]);

  return (
    <Card className="w-full p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Results Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Player</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Position</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.map(([player, position]) => (
              <tr
                key={player}
                className="border-b border-slate-100 hover:bg-blue-50 transition-colors"
              >
                <td className="py-3 px-4 text-slate-700">{player}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-600 text-lg">
                  {position}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
