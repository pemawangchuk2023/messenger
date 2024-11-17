'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type Variant = 'LOGIN' | 'REGISTER';

const authFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const AuthForm = () => {
  const { toast } = useToast();
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    setVariant((prev) => (prev === 'LOGIN' ? 'REGISTER' : 'LOGIN'));
  }, []);

  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      name: variant === 'REGISTER' ? '' : undefined,
      email: '',
      password: '',
    },
  });
  const onSubmit = async (values: z.infer<typeof authFormSchema>) => {
    console.log('onSubmit called with values:', values);
    setIsLoading(true);
    try {
      if (variant === 'REGISTER') {
        await axios.post('/api/register', values);
        const callback = await signIn('credentials', {
          ...values,
          redirect: false,
        });
        if (callback?.error) {
          console.log('Registration error:', callback.error);
          toast({
            variant: 'destructive',
            description: 'The registration has failed. Please try again',
          });
        } else {
          toast({
            description: 'Account registered successfully',
          });
        }
      } else if (variant === 'LOGIN') {
        const callback = await signIn('credentials', {
          ...values,
          redirect: false,
        });
        if (callback?.error) {
          console.log('Login error:', callback.error);
          toast({
            variant: 'destructive',
            description: 'Invalid credentials',
          });
        } else if (callback?.ok && !callback?.error) {
          console.log('User logged in successfully:', values);
          toast({
            description: 'Logged in successfully',
          });
        }
      }
    } catch (error) {
      console.error('Error during authentication process:', error);
      toast({
        variant: 'destructive',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [session?.status, router]);
  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 mt-0'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white px-4 py-8 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:px-10'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
            >
              {variant === 'REGISTER' && (
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg sm:text-xl text-gray-800 font-semibold'>
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder='Pema Wangchuk..'
                          {...field}
                          className='mt-2 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200'
                        />
                      </FormControl>
                      <FormMessage className='text-sm text-red-500 mt-1' />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg sm:text-xl text-gray-800 font-semibold'>
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder='pemawangchuk@ymail.com'
                        {...field}
                        className='mt-2 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200'
                      />
                    </FormControl>
                    <FormMessage className='text-sm text-red-500 mt-1' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg sm:text-xl text-gray-800 font-semibold'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        disabled={isLoading}
                        placeholder='******'
                        {...field}
                        className='mt-2 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200'
                      />
                    </FormControl>
                    <FormMessage className='text-sm text-red-500 mt-1' />
                  </FormItem>
                )}
              />
              <div>
                <Button
                  disabled={isLoading}
                  type='submit'
                  className='w-full h-12 text-lg sm:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 rounded-lg'
                >
                  {isLoading
                    ? 'Logging In...'
                    : variant === 'LOGIN'
                    ? 'Sign In'
                    : 'Register'}
                  {isLoading && (
                    <Image
                      src='/images/loader.svg'
                      alt='loader'
                      width={15}
                      height={15}
                      className='ml-2 animate-spin'
                    />
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <div className='mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 text-sm sm:text-base text-gray-600 font-medium'>
            <div>
              {variant === 'LOGIN'
                ? 'New to Messenger?'
                : 'Already have an account?'}
            </div>
            <div
              onClick={toggleVariant}
              className='cursor-pointer text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200'
            >
              {variant === 'LOGIN' ? 'Create an account' : 'Login'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
