"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NotesCard from './NotesCard';
import PastPaperCard from './PastPaperCard';
import ForumCard from './ForumCard';
import { useRouter } from 'next/navigation';
import { ForumPost, Tag, Comment, PastPaper, Note, User } from "@prisma/client";

export interface ForumPostItem extends Omit<ForumPost, 'upvoteCount' | 'downvoteCount'> {
  type: 'forumpost';
  author?: { name: string | null };
  tags: Tag[];
  comments: (Comment & { author: User })[];
  upvoteCount: number;
  downvoteCount: number;
  votes: { type: 'UPVOTE' | 'DOWNVOTE' }[];
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
}

export interface PastPaperItem extends Omit<PastPaper, 'type'> {
  type: 'pastpaper';
}

export interface NoteItem extends Omit<Note, 'type'> {
  type: 'note';
}

export type Item = PastPaperItem | NoteItem | ForumPostItem;

export function mapUploadToItem(upload: any): Item | undefined {
  if (!upload || typeof upload !== 'object') {
    console.error("Invalid upload data:", upload);
    return undefined;
  }

  try {
    switch (upload.type) {
      case 'forumpost':
        return {
          ...upload,
          type: 'forumpost',
          author: upload.author || { name: null },
          tags: upload.tags || [],
          comments: upload.comments || [],
          upvoteCount: upload.upvoteCount || 0,
          downvoteCount: upload.downvoteCount || 0,
          votes: upload.votes || [],
          userVote: upload.userVote || null
        } as ForumPostItem;
      case 'note':
        return {
          ...upload,
          type: 'note'
        } as NoteItem;
      case 'pastpaper':
        return {
          ...upload,
          type: 'pastpaper'
        } as PastPaperItem;
      default:
        console.error(`Unknown upload type: ${(upload as any).type}`);
        return undefined;
    }
  } catch (error) {
    console.error("Error mapping upload to item:", error);
    return undefined;
  }
}

export interface UploadFetchProps {
  items: Item[];
  activeTab: string;
}

const ProfileUploadFilter: React.FC<UploadFetchProps> = ({ items, activeTab }) => {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      setCurrentTab(activeTab);
    }, [activeTab]);
  
    const tabs = ['Past Papers', 'Notes', 'Forum'];
  
    const handleTabChange = useCallback((tab: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('type', tab);
      url.searchParams.set('page', '1');
      router.push(url.toString());
    }, [router]);
  
    const filteredItems = useMemo(() => {
      try {
        return items.filter(item => {
          switch (currentTab) {
            case 'Past Papers':
              return item.type === 'pastpaper';
            case 'Notes':
              return item.type === 'note';
            case 'Forum':
              return item.type === 'forumpost';
            default:
              return false;
          }
        });
      } catch (error) {
        console.error("Error filtering items:", error);
        setError("An error occurred while filtering items. Please try again later.");
        return [];
      }
    }, [items, currentTab]);
  
    const renderContent = useCallback(() => {
      if (error) {
        return (
          <div className="flex justify-center items-center h-[calc(65vh-200px)]">
            <p className="text-red-500">{error}</p>
          </div>
        );
      }
  
      if (filteredItems.length === 0) {
        return (
          <div className="flex justify-center items-center h-[calc(65vh-200px)]">
            <p className="text-gray-500">It seems you have not uploaded anything as of now...</p>
          </div>
        );
      }
  
      if (currentTab === 'Forum') {
        return (
          <div className="flex flex-col gap-4 pt-6">
            {filteredItems.map((item) => {
              if (item.type === 'forumpost') {
                const forumPostItem = item as ForumPostItem;
                return (
                  <ForumCard
                    key={forumPostItem.id}
                    post={forumPostItem}
                    title={forumPostItem.title}
                    desc={forumPostItem.description}
                    author={forumPostItem.author?.name || null}
                    createdAt={forumPostItem.createdAt}
                    tags={forumPostItem.tags}
                    comments={forumPostItem.comments}
                  />
                );
              }
              return null;
            })}
          </div>
        );
      }
  
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
          {filteredItems.map((item, index) => {
            switch (item.type) {
              case 'pastpaper':
                return (
                  <div key={item.id} className="flex justify-center">
                    <PastPaperCard index={index} pastPaper={item} />
                  </div>
                );
              case 'note':
                return (
                  <div key={item.id} className="flex justify-center">
                    <NotesCard index={index} note={item} />
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      );
    }, [currentTab, filteredItems, error]);
  
    return (
      <div className="flex flex-col items-center">
        <div 
          role="tablist" 
          aria-label="Upload types" 
          className="flex flex-wrap justify-center w-fit space-x-2 sm:space-x-4 bg-[#82BEE9] dark:bg-[#232530] p-2 sm:p-2 mb-6"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={currentTab === tab}
              aria-controls={`${tab.toLowerCase()}-panel`}
              id={`${tab.toLowerCase()}-tab`}
              onClick={() => handleTabChange(tab)}
              className={`px-1 py-1 sm:px-1 sm:py-1 text-sm sm:text-xs transition-colors duration-200 ${
                currentTab === tab ? 'bg-[#C2E6EC] dark:bg-[#0C1222] font-semibold' : 'hover:bg-[#ffffff]/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div 
          role="tabpanel" 
          id={`${currentTab.toLowerCase()}-panel`}
          aria-labelledby={`${currentTab.toLowerCase()}-tab`}
          className="flex justify-center w-svw"
        >
          <div className="w-full md:w-3/4">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }
  
  export default ProfileUploadFilter;