'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@prisma/client';

// Zod schema to validate group chat form
const groupChatSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  members: z
    .array(z.number()) // Accept integers for member IDs
    .min(1, { message: 'At least one member is required.' }),
});

type GroupChatFormValues = z.infer<typeof groupChatSchema>;

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal = ({ isOpen, onClose, users }: GroupChatModalProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GroupChatFormValues>({
    resolver: zodResolver(groupChatSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const onSubmit = async (data: GroupChatFormValues) => {
    console.log('Payload sent to API:', data);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/conversations', {
        ...data,
        isGroup: true,
      });
      console.log('Group chat created successfully:', response.data);
      toast({
        description: 'Group chat created successfully.',
      });
      router.refresh();
      onClose();
    } catch (error) {
      console.error(
        'Error creating group chat:',
        error.response?.data || error.message || error
      );
      toast({
        variant: 'destructive',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold'>Create Group Chat</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='mt-4 space-y-4'
            >
              {/* Group Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder='Enter group name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Members Selection */}
              <FormField
                control={form.control}
                name='members'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        {/* Dropdown to add members */}
                        <Select
                          onValueChange={(value) => {
                            const numericValue = parseInt(value, 10);
                            if (!field.value.includes(numericValue)) {
                              field.onChange([...field.value, numericValue]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select a member' />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem
                                key={user.id}
                                value={String(user.id)}
                              >
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* List of selected members */}
                        {field.value.length > 0 ? (
                          <div className='flex flex-wrap gap-2 mt-2'>
                            {field.value.map((memberId) => {
                              const user = users.find((u) => u.id === memberId);
                              return (
                                <span
                                  key={memberId}
                                  className='px-2 py-1 bg-gray-200 rounded-md flex items-center'
                                >
                                  {user?.name || `ID: ${memberId}`}
                                  <Button
                                    className='ml-2 text-red-500'
                                    onClick={() =>
                                      field.onChange(
                                        field.value.filter(
                                          (id) => id !== memberId
                                        )
                                      )
                                    }
                                  >
                                    ×
                                  </Button>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className='text-gray-500'>No members selected</p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
