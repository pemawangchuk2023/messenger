import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    // Step 1: Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser?.id || !currentUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Parse the request body
    const body = await request.json();
    const { message, image, conversationId } = body;

    // Step 3: Validate input
    if (!message?.trim() && !image) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Step 4: Check if the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId) },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation Not Found' },
        { status: 404 }
      );
    }

    // Step 5: Create a new message
    const newMessage = await prisma.message.create({
      data: {
        body: message || null,
        image: image || null,
        conversation: { connect: { id: conversation.id } },
        sender: { connect: { id: currentUser.id } },
        seen: { connect: { id: currentUser.id } },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    console.log('New message created:', newMessage);

    // Step 6: Update the conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        messages: { connect: { id: newMessage.id } },
      },
      include: {
        users: true,
        messages: { include: { seen: true } },
      },
    });

    console.log('Conversation updated successfully:', updatedConversation);

    const trimmedMessage = {
      id: newMessage.id,
      body: newMessage.body,
      image: newMessage.image,
      createdAt: newMessage.createdAt,
      sender: {
        id: newMessage.sender.id,
        name: newMessage.sender.name,
        image: newMessage.sender.image,
      },
    };

    console.log('Triggering Pusher event for message:new:', {
      conversationId: String(conversationId),
      message: trimmedMessage,
    });

    // Trigger Pusher for new message

    await pusherServer.trigger(
      String(conversationId),
      'messages:new',
      trimmedMessage
    );
    console.log('Pusher event for message:new triggered successfully');

    // Get last message
    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    // Trigger Pusher for each user's conversation update
    updatedConversation.users.map(async (user) => {
      console.log('Triggering Pusher event for message:update:', {
        email: user.email,
        lastMessage,
      });

      try {
        await pusherServer.trigger(user.email!, 'message:update', {
          id: conversationId,
          messages: [
            {
              id: lastMessage.id,
              body: lastMessage.body,
              createdAt: lastMessage.createdAt,
            },
          ],
        });
        console.log(
          `Pusher event for message:update triggered successfully for user: ${user.email}`
        );
      } catch (error) {
        console.error(`Error triggering Pusher for user ${user.email}:`, error);
      }
    });

    // Step 8: Return the created message
    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error('Error handling POST /api/messages:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
