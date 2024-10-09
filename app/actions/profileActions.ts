import { PrismaClient, Note, ForumPost, PastPaper, Tag, User, Comment } from "@prisma/client";

const prisma = new PrismaClient();

type UserData = {
  notes: Note[];
  forums: (ForumPost & { author: User; tags: Tag[]; comments: (Comment & { author: User })[] })[];
  papers: PastPaper[];
}

async function fetchUserNotes(userId: string): Promise<Note[]> {
  try {
    return await prisma.note.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
}

async function fetchUserPastPapers(userId: string): Promise<PastPaper[]> {
  try {
    return await prisma.pastPaper.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching user past papers:", error);
    return [];
  }
}

async function fetchUserForumPosts(userId: string): Promise<(ForumPost & { author: User; tags: Tag[]; comments: (Comment & { author: User })[] })[]> {
  try {
    return await prisma.forumPost.findMany({
      where: { authorId: userId },
      include: {
        author: true,
        tags: true,
        comments: { include: { author: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error fetching user forum posts:", error);
    return [];
  }
}

export async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const [notes, papers, forums] = await Promise.all([
      fetchUserNotes(userId),
      fetchUserPastPapers(userId),
      fetchUserForumPosts(userId),
    ]);
    
    return { notes, papers, forums };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { notes: [], papers: [], forums: [] };
  }
}
