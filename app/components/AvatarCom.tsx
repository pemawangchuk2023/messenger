import { User } from '@prisma/client';
import Image from 'next/image';
import React from 'react';
import useActiveList from '../hooks/useActiveList';

interface AvatarComProps {
  user?: User;
}

const AvatarCom = ({ user }: AvatarComProps) => {
  const { members } = useActiveList();
  const isActive = members.indexOf(user?.email!) !== -1;

  return (
    <div className='relative'>
      <div className='relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-full md:w-full'>
        <Image
          alt='Avatar'
          src={user?.image || '/images/placeholder.png'}
          width={45}
          height={45}
        />
      </div>
      {isActive && (
        <span className='absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:h-3 md:w-3' />
      )}
    </div>
  );
};

export default AvatarCom;
