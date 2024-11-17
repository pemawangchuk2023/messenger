'use client';

import React, { useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { HiPaperAirplane, HiPhoto } from 'react-icons/hi2';
import axios from 'axios';
import useConversation from '@/app/hooks/useConversation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import MessageInput from './MessageInput';
import { Input } from '@/components/ui/input';

const messageSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty' }),
});

type MessageFormValues = z.infer<typeof messageSchema>;

const FormComponent = () => {
  const { conversationId } = useConversation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (data: MessageFormValues) => {
    try {
      form.reset();
      await axios.post('/api/messages', {
        message: data.message,
        conversationId,
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      await axios.post('/api/messages', {
        image: data.url,
        conversationId,
      });

      form.reset();
    } catch (error: any) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <div className='py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={() => fileInputRef.current?.click()}
        aria-label='Upload image'
      >
        <HiPhoto
          size={30}
          className='text-sky-500'
        />
      </Button>
      <Input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        onChange={handleUpload}
        aria-hidden='true'
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex items-center gap-2 lg:gap-4 w-full'
        >
          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <MessageInput
                    id={field.name}
                    register={form.register}
                    errors={form.formState.errors}
                    required
                    placeholder='Write a message'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='bg-sky-500 text-white py-2 px-4 rounded-full hover:bg-sky-600 transition cursor-pointer'
            aria-label='Send message'
          >
            <HiPaperAirplane
              size={30}
              className='text-white'
            />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default FormComponent;
