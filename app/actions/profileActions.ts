// serverActions.ts
'use server';

import { PrismaClient, Note, ForumPost, PastPaper, Tag, User, Comment } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchUserNotes(userId: string): Promise<Note[]> {
    console.log(":)");
  try {
    const filteredNotes = await prisma.note.findMany({
      where: {
        authorId: userId
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return filteredNotes;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
}

export async function fetchUserPastPapers(userId: string): Promise<PastPaper[]> {
  try {
    const filteredPapers = await prisma.pastPaper.findMany({
      where: {
        authorId: userId
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return filteredPapers;
  } catch (error) {
    console.error("Error fetching user past papers:", error);
    return [];
  }
}

export async function fetchUserForumPosts(userId: string): Promise<(ForumPost & { author: User; tags: Tag[]; comments: (Comment & { author: User })[] })[]> {
  try {
    const filteredPosts = await prisma.forumPost.findMany({
      where: {
        authorId: userId
      },
      include: {
        author: true,
        tags: true,
        comments: {
          include: {
            author: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return filteredPosts;
  } catch (error) {
    console.error("Error fetching user forum posts:", error);
    return [];
  }
}