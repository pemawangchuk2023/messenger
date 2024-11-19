import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function DELETE(
  request: Request,
  { params }: { params: { conversationId?: string } }
) {
  try {
    // Step 1: Extract conversationId from params and validate
    const { conversationId } = params;

    if (!conversationId) {
      return new NextResponse('Missing conversation ID', { status: 400 });
    }

    // Step 2: Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Step 3: Check if the conversation exists
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
      include: { users: true },
    });

    existingConversation?.users.forEach((user) => {
      if (user.id === currentUser.id) {
        pusherServer.trigger(
          user.email!,
          'conversation:remove',
          existingConversation
        );
      }
    });
    if (!existingConversation) {
      return new NextResponse('Conversation Not Found', { status: 404 });
    }

    // Step 4: Validate the user is part of the conversation
    const isParticipant = existingConversation.users.some(
      (user) => user.id === currentUser.id
    );

    if (!isParticipant) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Step 5: Delete the conversation
    const deletedConversation = await prisma.conversation.delete({
      where: { id: Number(conversationId) },
    });

    // Step 6: Return success response
    return NextResponse.json(deletedConversation);
  } catch (error: any) {
    console.error('Internal server error:', error.message);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
