'use client';

import useConversation from '@/app/hooks/useConversation';
import { FullConversationType } from '@/app/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { MdOutlineGroupAdd } from 'react-icons/md';
import ConversationBox from './ConversationBox';
import GroutChatModal from './GroutChatModal';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}
const ConversationList = ({ initialItems, users }: ConversationListProps) => {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { conversationId, isOpen } = useConversation();

  const session = useSession();
  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }
    pusherClient.subscribe(pusherKey);
    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }
        return [conversation, ...current];
      });
    };
    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }
          return currentConversation;
        })
      );
    };
    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [
          ...current.filter(
            (currentConversation) => currentConversation.id !== conversation.id
          ),
        ];
      });
      if (conversationId === conversation.id) {
        router.push('/conversations');
      }
    };
    pusherClient.bind('conversation:new', newHandler);
    pusherClient.bind('conversation:update', updateHandler);
    pusherClient.bind('conversation:remove', removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind('conversation:new', newHandler);
      pusherClient.unbind('conversation:update', updateHandler);
      pusherClient.unbind('conversation:remove', removeHandler);
    };
  }, [pusherKey, conversationId, router]);
  return (
    <>
      <GroutChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={cn(
          `fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200`,
          isOpen ? 'hidden' : 'block w-full left-0'
        )}
      >
        <div className='px-5'>
          <div className='flex justify-between mb-4 pt-4'>
            <div
              onClick={() => setIsModalOpen(true)}
              className='text-2xl font-bold text-neutral-800'
            >
              Messages
            </div>
            <div className='rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition'>
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => {
            return (
              <ConversationBox
                key={item.id}
                data={item}
                selected={parseInt(conversationId) === item.id}
              />
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
