'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
import { CldImage } from 'next-cloudinary';

const settingsFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  image: z.string().url({ message: 'Invalid image URL.' }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    image?: string;
  };
}

const SettingsModal = ({
  isOpen,
  onClose,
  currentUser,
}: SettingsModalProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: currentUser.name,
      image: currentUser.image || '',
    },
  });

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('Upload returned no URL');
      }

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await handleFileUpload(file);
        form.setValue('image', imageUrl, { shouldValidate: true });
      } catch (error) {
        toast({
          variant: 'destructive',
          description: 'Failed to upload image. Please try again.',
        });
      }
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        description: 'Settings updated successfully.',
      });
      router.refresh();
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred. Please try again.',
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
          <h2 className='text-xl font-semibold'>Your Profile</h2>
          <p className='text-sm text-gray-600'>Edit your public information.</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='mt-4 space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder='Your name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className='flex items-center gap-x-3'>
                        <CldImage
                          src={
                            field.value ||
                            currentUser.image ||
                            'https://via.placeholder.com/48'
                          }
                          alt='Profile Picture'
                          width={48}
                          height={48}
                          crop='fill'
                          className='rounded-full'
                        />

                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            document.getElementById('file-input')?.click()
                          }
                        >
                          Upload
                        </Button>
                        <Input
                          type='file'
                          id='file-input'
                          className='hidden'
                          accept='image/*'
                          onChange={handleFileChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
