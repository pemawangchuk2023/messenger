import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    // Check for authenticated user
    if (!currentUser?.id || !currentUser?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Validate data for group conversation
    if (isGroup) {
      if (!members || members.length < 2 || !name) {
        return new Response('Invalid data for group chat', { status: 400 });
      }

      // Validate members
      const validUsers = await prisma.user.findMany({
        where: {
          id: { in: members },
        },
        select: { id: true },
      });

      if (validUsers.length !== members.length) {
        return new Response('Some members are invalid', { status: 400 });
      }

      // Create a new group conversation
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...validUsers.map((user) => ({ id: user.id })),
              { id: currentUser.id },
            ],
          },
        },
        include: {
          users: true,
        },
      });
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, 'conversation:new', newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    // For one-on-one conversations
    if (!userId) {
      return new Response('Invalid data for one-on-one chat', { status: 400 });
    }

    // Check if conversation already exists
    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
      include: {
        users: true,
      },
    });

    // Return existing conversation if found
    if (existingConversations.length > 0) {
      return NextResponse.json(existingConversations[0]);
    }

    // Create a new one-on-one conversation
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: currentUser.id }, { id: userId }],
        },
      },
      include: {
        users: true,
      },
    });
    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:new', newConversation);
      }
    });
    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
