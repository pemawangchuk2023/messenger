import getCurrentUser from "./getCurrentUser";
import prisma from "@/lib/prismadb";
import { FullConversationType } from "@/app/types";

const getConversations = async (): Promise<FullConversationType[]> => {
  const currentUser = await getCurrentUser();

  console.log("The current user is", currentUser); // Log current user

  if (!currentUser?.id) {
    return [];
  }

  try {
    console.log("Fetching conversations for user ID:", currentUser.id);

    const conversations = (await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
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

    console.log("Fetched conversations:", conversations); // Log fetched conversations
    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export default getConversations;
