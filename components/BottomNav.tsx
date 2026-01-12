'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Zap, 
  Code, 
  Rocket, 
  BookOpen,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dash', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Play', href: '/playground', icon: Zap },
  { name: 'Models', href: '/models', icon: Rocket },
  { name: 'Docs', href: '/docs', icon: BookOpen },
];

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-border/50 px-2 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-300 min-w-[60px]',
                isActive
                  ? 'text-primary scale-110'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'stroke-[2.5px]' : 'stroke-2'
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-1 transition-all duration-300 min-w-[60px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <Menu className="h-5 w-5 stroke-2" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
