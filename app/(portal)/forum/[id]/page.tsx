import { PrismaClient } from "@prisma/client";
import ForumPostPage from "./ForumPost";
import { auth } from "@/app/auth";
import { recordViewHistory } from "@/app/actions/viewHistory";
import { notFound } from "next/navigation";

async function forumPostThread({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('User not found');
  }

  const prisma = new PrismaClient();
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
    return notFound();
  }

  if (userId) {
    await recordViewHistory('forumPost', forumpost.id, userId);
  }

  const userVote = forumpost.votes[0];
  const initialLikeStatus = userVote?.type === 'UPVOTE';
  const initialDislikeStatus = userVote?.type === 'DOWNVOTE';

  return (
    <ForumPostPage
      post={forumpost}
      tagArray={forumpost?.tags}
      commentArray={forumpost?.comments}
      initialLikeStatus={initialLikeStatus}
      initialDislikeStatus={initialDislikeStatus}
    />
  );
}

export default forumPostThread;
