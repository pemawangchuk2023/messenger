import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

interface IParams {
  conversationId: string;
}

export async function POST(request: Request, context: { params: IParams }) {
  try {
    // Await the params to ensure it's resolved
    const params = await context.params;

    // Validate that params and conversationId exist
    if (!params?.conversationId) {
      return new NextResponse('Invalid conversationId', { status: 400 });
    }

    const currentUser = await getCurrentUser();

    // Check if the user is authorized
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: Number(params.conversationId),
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    // Find the last message
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // Update the seen status for the last message
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
