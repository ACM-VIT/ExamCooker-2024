'use client'

import React, { useEffect, useState } from 'react';
import { Note, ForumPost, PastPaper, Tag, User, Comment } from "@prisma/client";
import ProfileUploadFilter, { mapUploadToItem, Item } from '@/app/components/ProfileUploadFilter';
import { fetchUserData } from '../../actions/profileActions';
import { SignOut } from '@/app/components/sign-out';
import { auth } from '../../auth';

type ExtendedForumPost = ForumPost & {
  author: User;
  tags: Tag[];
  comments: (Comment & { author: User })[];
};

type UserData = {
  notes: Note[];
  papers: PastPaper[];
  forums: ExtendedForumPost[];
};

export default function ProfilePage() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof auth>> | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('Past Papers');

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     const sessionData = await auth();
  //     setSession(sessionData);
  //   };
  //   fetchSession();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        const data = await fetchUserData(session.user.id);
        setUserData(data);
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');
    if (type) {
      setActiveTab(type);
    }
  }, []);

  const allItems: Item[] = userData
    ? [
        ...userData.notes.map(note => mapUploadToItem({ ...note, type: 'note' })),
        ...userData.papers.map(paper => mapUploadToItem({ ...paper, type: 'pastpaper' })),
        ...userData.forums.map(forum => mapUploadToItem({ ...forum, type: 'forumpost' }))
      ].filter((item): item is Item => item !== undefined)
    : [];

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 mb-8">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {session.user?.name}'s Profile
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Email: {session.user?.email}
        </p>
        <SignOut>
          <span className="text-red-500 hover:underline dark:text-red-400">
            Logout
          </span>
        </SignOut>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Activity</h2>
        <ProfileUploadFilter items={allItems} activeTab={activeTab} />
      </div>
    </div>
  );
}