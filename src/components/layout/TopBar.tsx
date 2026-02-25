"use client";
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from './AppLayout';

interface TopBarProps {
  title?: string;
}

// Temporary User for now
const user = { regionName: "Bratislava" };

export function TopBar({ title }: TopBarProps) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border-dark bg-surface-dark md:hidden">
      <div className="flex items-center justify-between p-4 h-full">
        {/* Left side */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-text-secondary hover:text-primary transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AS</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:inline-block">
            ArtStone
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User / Theme toggle placeholder */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
