'use client';

import { Card } from '@/components/ui/card';

type Assignment = {
  teamName: string;
  position: number;
  playerName: string;
};

interface AssignmentTableProps {
  assignments: Assignment[];
}

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  const sorted = [...assignments].sort((a, b) => a.position - b.position);

  return (
    <Card className="w-full p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Assignments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Team</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Position</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Player Name</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-blue-50 transition-colors"
              >
                <td className="py-3 px-4 text-slate-700">{item.teamName}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-600 text-lg">
                  {item.position}
                </td>
                <td className="py-3 px-4 text-slate-700">{item.playerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
