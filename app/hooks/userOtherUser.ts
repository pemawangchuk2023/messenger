'use client';

import { User } from '@prisma/client';
import { FullConversationType } from '../types';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

const useOtherUser = (
  conversation: FullConversationType | { users: User[] }
) => {
  const session = useSession();

  const otherUser = useMemo(() => {
    const currentUserEmail = session.data?.user?.email;
    if (!currentUserEmail) {
      return conversation.users[1];
    }
    const otherUser = conversation.users.find(
      (user) => user.email !== currentUserEmail
    );

    return otherUser || conversation.users[0];
  }, [session.data?.user?.email, conversation.users]);

  return otherUser;
};

export default useOtherUser;
