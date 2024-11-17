'use client';

import { FullMessageType } from '@/app/types';
import React, { useEffect, useRef, useState } from 'react';
import useConversation from '@/app/hooks/useConversation';
import MessageBox from './MessageBox';
import axios from 'axios';
import { pusherClient } from '@/lib/pusher';
import { find } from 'lodash';

interface BodyProps {
  Initialmessages: FullMessageType[];
}

const Body = ({ Initialmessages }: BodyProps) => {
  const [messages, setMessages] = useState(Initialmessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    pusherClient.subscribe(conversationId);
    console.log(`Subscribed to channel: ${conversationId}`);

    const messageHandler = (message: FullMessageType) => {
      console.log('Received message:', message);
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
      bottomRef.current?.scrollIntoView();
    };

    pusherClient.bind('messages:new', messageHandler);

    return () => {
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unsubscribe(conversationId);
      console.log(`Unsubscribed from channel: ${conversationId}`);
    };
  }, [conversationId]);

  return (
    <div className='flex-1 overflow-y-auto'>
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div
        ref={bottomRef}
        className='pt-24'
      />
    </div>
  );
};

export default Body;
