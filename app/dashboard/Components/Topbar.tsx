'use client';
import React from 'react';
import { Moon, Sun, Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useSalesStore } from '../../useSalesStore';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

const Topbar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { theme, setTheme } = useTheme();
  const { setOpenSalesPersonDialog } = useSalesStore();
  // const { user } = useUser();

  return (
    <div className="w-full ">
      <div className="container mx-auto sm:px-8 px-4">
        <div className="h-14 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center ">
            <Image 
              src="/salex-logo.png" 
              alt="logo" 
              width={60} 
              height={25}
              priority 
              style={{ height: 'auto', width: 'auto' }}
            />
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

          {/* Add Sale, UserButton and Theme Toggle buttons */}
          <div className="flex items-center gap-6">
            {/* Add Sales person Button */}
            <Button
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white sm:mr-4"
              size="sm"
              onClick={() => setOpenSalesPersonDialog(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span className="max-sm:hidden">Sales Team</span>
            </Button>

            {/* User Button */}
            <UserButton
              afterSwitchSessionUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: 'h-8 w-8',
                },
              }}
            />

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
