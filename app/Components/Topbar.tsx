'use client';
import React from 'react';
import { Moon, Sun, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useSalesStore } from '../useSalesStore';

const Topbar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { theme, setTheme } = useTheme();
  const { setOpenDealDialog } = useSalesStore();

  return (
    <div className="w-full ">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Salesphere
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md px-4 hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                type="search"
                placeholder="Search..."
                className="w-full pl-9 bg-muted/40 border-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Add Sale and Theme Toggle buttons */}
          <div className="flex items-center gap-6">
            {/* Add Sale Button */}
            <Button
              className="flex items-center gap-1 bg-primary text-white"
              size="sm"
              onClick={() => setOpenDealDialog(true)}
            >
              <Plus className="sm:h-4 sm:w-4 h-3.5 w-3.5" />
              <span className="max-sm:hidden">Add Sale</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-muted/40 border-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
