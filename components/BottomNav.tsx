'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, Copy } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  if (pathname === '/auth/login' || pathname === '/auth/signup') {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Contests', href: '/contests', icon: Trophy },
    { name: 'My Cards', href: '/dashboard', icon: Copy }, // Could link to a specific path but dashboard shows joined contests
    { name: 'Profile', href: '/dashboard', icon: User } // Add actual profile route if exists
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'animate-bounce-short' : ''} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
