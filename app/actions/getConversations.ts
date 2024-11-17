import getCurrentUser from './getCurrentUser';
import prisma from '@/lib/prismadb';
import { FullConversationType } from '@/app/types';

const getConversations = async (): Promise<FullConversationType[]> => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
    const conversations = (await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc',
      },
      where: {
        users: {
          some: {
            id: currentUser.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    })) as FullConversationType[];
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export default getConversations;
