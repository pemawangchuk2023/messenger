'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

const LoadingModal = ({ isOpen, onOpenChange }: LoadingModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-center'>
            <Loader2 className='w-10 h-10 animate-spin mx-auto mb-4' />
            Loading
          </DialogTitle>
          <DialogDescription className='text-center'>
            Please wait while we process your request...
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
