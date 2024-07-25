import { PrismaClient } from "@prisma/client";
import ForumPost from "./ForumPost";
import { auth } from "@/app/auth";
import { recordViewHistory } from "@/app/actions/viewHistory";

async function forumPostThread({ params }: { params: { id: string } }) {

  const prisma = new PrismaClient();

  const session = await auth();
  const userId = session?.user?.id;

  const forumpost = await prisma.forumPost.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: {
          name: true,
        }
      },
      votes: {
        where: {
          userId: userId
        }
      },
      tags: true,
      comments: {
        include: {
          author: true,
        }
      },
    },
  });
  if (!forumpost) {
    throw new Error('Forum post not found');
  }


  if (userId) {
    await prisma.viewHistory.upsert({
      where: { userId_forumPostId: { userId, forumPostId: forumpost.id } },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        forumPostId: forumpost.id,
        viewedAt: new Date(),
      },
    })
  }


  return (
    <ForumPost post={forumpost} />
  )
}

export default forumPostThread;
