'use client';
import React from 'react';
import { Moon, Sun, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useSalesStore } from '../../useSalesStore';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useOrganization } from '@clerk/nextjs';

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

const Topbar = () => {
  const { theme, setTheme } = useTheme();
  const { setOpenSalesPersonDialog } = useSalesStore();
  const { organization } = useOrganization();
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
              width={80}
              height={80}
              priority
            />
          </div>

          {/* Add Sale, UserButton and Theme Toggle buttons */}
          <div className="flex items-center gap-6">
            {/* Add Sales person Button */}
            <Button
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white sm:mr-4"
              size="sm"
              onClick={() => setOpenSalesPersonDialog(true)}
            >
              <Users className="w-4 h-4" />
              <span className="max-sm:hidden">
                {organization?.name || 'Organization'}
              </span>
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
      </div>
    </div>
  );
};

export default Topbar;
