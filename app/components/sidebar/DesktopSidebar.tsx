'use client';

import useRoutes from '@/app/hooks/useRoutes';
import React, { useState } from 'react';
import DesktopItem from './DesktopItem';
import { User } from '@prisma/client';
import AvatarCom from '../AvatarCom';
import SettingsModal from './SettingsModal';

interface DesktopSidebarProps {
  currentUser: User;
}
const DesktopSidebar = ({ currentUser }: DesktopSidebarProps) => {
  const routes = useRoutes();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUser={{ name: currentUser.name, image: currentUser.image ?? '' }}
      />
      <div className='hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg: overflow-y-auto lg:bg-white lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between'>
        <nav className='mt-4 flex flex-col justify-between'>
          <ul
            role='list'
            className='flex flex-col space-y-1'
          >
            {routes.map((item) => (
              <DesktopItem
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
                onClick={item.onClick}
              />
            ))}
          </ul>
        </nav>
        <nav className='mt-4 flex flex-col justify-between items-center'>
          <div
            onClick={() => setIsOpen(true)}
            className='cursor-pointer hover:opacity-75 transition'
          >
            <AvatarCom user={currentUser} />
          </div>
        </nav>
      </div>
    </>
  );
};

export default DesktopSidebar;
