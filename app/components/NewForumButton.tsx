// components/NewForumButton.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NewForumButton: React.FC = () => {
  const router = useRouter();

  const handleCreateForum = () => {
    router.push('/create-forum');
  };

  return (
    <button
      className="bg-teal-400 border border-black text-black px-4 py-2 rounded transition-colors duration-300 hover:bg-teal-500"
      onClick={handleCreateForum}
    >
      +New
    </button>
  );
};

export default NewForumButton;