'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Conversation, User } from '@prisma/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import AvatarCom from '@/app/components/AvatarCom';
import useOtherUser from '@/app/hooks/userOtherUser';
import { Mail, Trash2, Users } from 'lucide-react';
import Modal from '@/app/components/Modal';
import AvatarGroup from '@/app/components/AvatarGroup';
import { Badge } from '@/components/ui/badge';
import useActiveList from '@/app/hooks/useActiveList';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Conversation & {
    users: User[];
  };
}

const ProfileDrawer = ({ isOpen, onClose, data }: ProfileDrawerProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const otherUser = useOtherUser(data);
  const { members } = useActiveList();

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const joinedDate = useMemo(() => {
    return format(new Date(otherUser.createdAt), 'PP');
  }, [otherUser.createdAt]);

  const title = useMemo(() => {
    return data.name || otherUser.name;
  }, [data.name, otherUser.name]);

  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? 'Active' : 'Offline';
  }, [data.isGroup, data.users.length]);

  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => setIsDeleteModalOpen(false)}
        title='Delete Conversation'
        description='Are you sure you want to delete this conversation? This action cannot be undone.'
        confirmText='Delete'
      />
      <Sheet
        open={isOpen}
        onOpenChange={onClose}
      >
        <SheetContent className='sm:max-w-md'>
          <SheetHeader>
            <SheetTitle className='text-2xl font-bold'>
              {title}&apos;s Profile
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-4rem)] pb-10'>
            <div className='flex flex-col items-center py-6'>
              {data.isGroup ? (
                <AvatarGroup users={data.users} />
              ) : (
                <AvatarCom user={otherUser} />
              )}
              <h2 className='mt-4 text-2xl font-semibold'>{title}</h2>
              <Badge
                variant='secondary'
                className='mt-2'
              >
                {data.isGroup ? <Users className='mr-1 h-3 w-3' /> : null}
                {statusText}
              </Badge>
            </div>
            <div className='flex justify-center my-6'>
              <Button
                variant='destructive'
                size='sm'
                className='flex items-center gap-2'
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className='h-4 w-4' />
                <span>Delete Conversation</span>
              </Button>
            </div>
            <Separator />
            <div className='px-4 py-6 space-y-8'>
              {data.isGroup && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <Mail className='h-5 w-5' />
                    Member Emails
                  </h3>
                  <ul className='space-y-2'>
                    {data.users.map((user) => (
                      <li
                        key={user.id}
                        className='flex items-center gap-2 p-2 rounded-md hover:bg-accent'
                      >
                        <AvatarCom user={user} />
                        <span className='text-sm'>{user.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!data.isGroup && (
                <>
                  <Separator />
                  <div>
                    <h3 className='text-lg font-semibold'>Joined</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      <time dateTime={joinedDate}>{joinedDate}</time>
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProfileDrawer;
