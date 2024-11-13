import { User } from "@prisma/client";
import { FullConversationType } from "../types";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

const useOtherUser = (
  conversation: FullConversationType | { users: User[] }
) => {
  const session = useSession();
  console.log("The session is for Messenger is", session)

  const otherUser = useMemo(() => {
    const currentUserEmail = session?.data?.user?.email;
    
    console.log('Current user email:', currentUserEmail);
    console.log('Conversation users:', conversation.users);

    const otherUser = conversation.users.filter(

      (user) => user.email !== currentUserEmail
    );
    console.log('Other user:', otherUser);

    return otherUser[0];
  }, [session?.data?.user?.email, conversation.users]);

  return otherUser;
};

export default useOtherUser;