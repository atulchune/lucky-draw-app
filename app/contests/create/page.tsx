'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function CreateContestPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team1_name: 'Team 1',
    team2_name: 'Team 2',
    num_positions: 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'num_positions' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to create a contest');
        return;
      }

      // Call server API for encrypted position creation
      const response = await fetch('/api/contests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          team1_name: formData.team1_name,
          team2_name: formData.team2_name,
          num_positions: formData.num_positions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create contest');
      }

      // Redirect to contest details
      router.push(`/contests/${result.contest_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create contest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
            Create New Contest
          </h1>
          <p className="text-lg text-slate-600">Set up your lucky draw contest</p>
        </div>

        {/* Form */}
        <Card className="bg-white shadow-lg p-8 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contest Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contest Name *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Team Event 2026"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your contest..."
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Team 1 Name *</label>
                <Input
                  type="text"
                  name="team1_name"
                  value={formData.team1_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Team 2 Name *</label>
                <Input
                  type="text"
                  name="team2_name"
                  value={formData.team2_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Number of Positions */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Positions per Team *</label>
              <Input
                type="number"
                name="num_positions"
                value={formData.num_positions}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-2">Total cards will be {formData.num_positions * 2} (each team gets {formData.num_positions})</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Contest'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
