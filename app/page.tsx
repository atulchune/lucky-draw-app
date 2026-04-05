import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto">
        <div className="text-2xl md:text-3xl font-black">Lucky Draw</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button className="bg-white text-blue-600 hover:bg-slate-100 font-bold">
              Login
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Lucky Draw Contests
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
            Create exciting lucky draw contests, assign random positions to teams, and celebrate winners. Perfect for events, team building, and competitions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-xl font-bold mb-2">Random Selection</h3>
              <p className="text-slate-300">Fair and exciting random position assignment for all participants</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Multi-Team</h3>
              <p className="text-slate-300">Support for multiple teams with customizable team names and positions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Winner Selection</h3>
              <p className="text-slate-300">Mark 1st, 2nd, and 3rd place winners and share results</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-6 px-10 text-lg rounded-lg shadow-xl">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-white text-blue-600 hover:bg-slate-100 font-bold py-6 px-10 text-lg rounded-lg shadow-xl">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 mt-12 py-8 text-center text-slate-400">
        <p>&copy; 2026 Lucky Draw Contests. All rights reserved.</p>
      </div>
    </div>
  );
}
