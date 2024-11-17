'use client';
import React from 'react';
import LoadingModal from '../components/LoadingModal';

const loading = () => {
  return (
    <div>
      <LoadingModal
        isOpen={true}
        onOpenChange={() => {}}
      />
    </div>
  );
};

export default loading;
