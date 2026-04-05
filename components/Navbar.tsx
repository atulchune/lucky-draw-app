import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from './ui/button';
import { LogoutButton } from '@/components/LogoutButton';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="w-full bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="font-black text-xl text-blue-700 tracking-tight">
          ContestPro
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-600 hidden md:block">
            {user.user_metadata?.full_name || user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
