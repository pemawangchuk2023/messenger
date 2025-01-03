"use client"
import React from 'react'
import useConversation from '../hooks/useConversation';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

const Home = () => {
  const {isOpen} = useConversation();
  return (
    <div className={cn(`lg-80 h-full lg:block`, isOpen ? "block" : "hidden")}>
        <EmptyState />
    </div>
  )
}

export default Home