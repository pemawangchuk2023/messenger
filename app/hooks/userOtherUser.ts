import { User } from '@prisma/client';
import { FullConversationType } from '../types';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

const useOtherUser = (
  conversation: FullConversationType | { users: User[] }
) => {
  const { data: session } = useSession();

  const otherUser = useMemo(() => {
    const currentUserEmail = session?.user?.email;
    const otherUsers = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );
    return otherUsers[0];
  }, [session?.user?.email, conversation.users]);

  return otherUser;
};

export default useOtherUser;
