'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Note, ForumPost, PastPaper, Tag, User, Comment } from "@prisma/client";
import NotesCard from "../../components/NotesCard";
import ForumCard from "@/app/components/ForumCard";
import PastPaperCard from "@/app/components/PastPaperCard";
import FavFetch, { mapBookmarkToItem } from '@/app/components/FavFetchFilter';
import { useSearchParams } from 'next/navigation';
import { fetchUserNotes, fetchUserPastPapers, fetchUserForumPosts } from '../../actions/profileActions';

type ExtendedForumPost = ForumPost & {
  author: User;
  tags: Tag[];
  comments: (Comment & { author: User })[];
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [userPapers, setUserPapers] = useState<PastPaper[]>([]);
  const [userForums, setUserForums] = useState<ExtendedForumPost[]>([]);
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'Past Papers';

  useEffect(() => {
    async function fetchUserData() {
      if (status === 'authenticated' && session?.user?.id) {
        const userId = session.user.id;

        try {
          console.log('Fetching user data for userId:', userId);
          const notes = await fetchUserNotes(userId);
          console.log('Fetched notes:', notes);
          setUserNotes(notes);

          const papers = await fetchUserPastPapers(userId);
          console.log('Fetched papers:', papers);
          setUserPapers(papers);

          const forums = await fetchUserForumPosts(userId);
          console.log('Fetched forums:', forums);
          setUserForums(forums);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    }

    fetchUserData();
  }, [status, session]);

  if (status === 'loading') {
    return <p className="text-center mt-8">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p className="text-center mt-8">Please log in to see your profile.</p>;
  }

  const allItems = [
    ...userNotes.map(note => mapBookmarkToItem({ ...note, type: 'note' })),
    ...userPapers.map(paper => mapBookmarkToItem({ ...paper, type: 'pastpaper' })),
    ...userForums.map(forum => mapBookmarkToItem({ ...forum, type: 'forumpost' }))
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 mb-8">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {session?.user?.name}'s Profile
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Email: {session?.user?.email}
        </p>
      </div>

      <div className="mb-8">
        <FavFetch items={allItems} activeTab={type} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Activity</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userNotes.map((note, index) => (
            <NotesCard key={note.id} note={note} index={index} />
          ))}
          {userPapers.map((paper, index) => (
            <PastPaperCard key={paper.id} pastPaper={paper} index={index} />
          ))}
          {userForums.map((forum) => (
            <ForumCard 
              key={forum.id}
              post={forum}
              title={forum.title}
              desc={forum.description}
              author={forum.author.name}
              tags={forum.tags}
              createdAt={forum.createdAt}
              comments={forum.comments}
            />
          ))}
        </div>
        
        {userNotes.length === 0 && userPapers.length === 0 && userForums.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any content yet.</p>
        )}
      </div>
    </div>
  );
}