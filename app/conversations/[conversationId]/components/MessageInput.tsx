'use client';

import { Input } from '@/components/ui/input';
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface MessageInputProps {
  placeholder?: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<{ message: string }>;
  errors: FieldErrors<{ message: string }>;
}

const MessageInput = ({
  placeholder,
  id,
  type,
  required,
  register,
  errors,
}: MessageInputProps) => {
  return (
    <div className='relative w-full'>
      <Input
        id={id}
        type={type}
        autoComplete={id}
        {...register(id, { required })}
        placeholder={placeholder}
        className='text-black font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none'
      />
    </div>
  );
};

export default MessageInput;
