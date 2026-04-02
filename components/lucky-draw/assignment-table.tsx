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
  // Group assignments by team
  const teams = Array.from(new Set(assignments.map((a) => a.teamName)));
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="w-full p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Assignments</h3>
        <p className="text-sm text-slate-600">Date: {today}</p>
      </div>

      <div className="space-y-8">
        {teams.map((team) => {
          const teamAssignments = assignments
            .filter((a) => a.teamName === team)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={team} className="overflow-x-auto">
              <h4 className="text-lg font-bold text-slate-700 mb-3 pb-2 border-b-2 border-amber-400">
                {team}
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Player Name</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAssignments.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="text-center py-3 px-4 font-bold text-blue-600 text-lg">
                        {item.position}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.playerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
