import React from 'react';
import TagContainer from "@/app/components/forumpost/TagContainer";
import CommentField from "@/app/components/forumpost/CommentField";
import CommentContainer from "@/app/components/forumpost/CommentContainer";
import { NumberOfComments } from "@/app/components/forumpost/CommentContainer";
import { VoteButtons } from "@/app/components/common/Buttons";

import { Prisma } from "@prisma/client";
import ForumPostGetPayload = Prisma.ForumPostGetPayload

function ForumPost({ post }: {
  post: ForumPostGetPayload<{
    include: {
      author: {
        select: {
          name: true,
        }
      },
      votes: true,
      tags: true,
      comments: {
        include: {
          author: true,
        }
      },
    }
  }>
}) {
  const userVote = post.votes.length > 0 ? post.votes[0].type : null;

  return (
    <div className="transition-colors w-full h-full p-6 text-black dark:text-[#D5D5D5]">
      <div className="bg-[#82BEE9] dark:bg-[#232530] p-4 md:p-10">
        <h2 className="font-extrabold">{post?.title}</h2>
        <hr className="border-0 h-px my-5 bg-black" />
        <h6>{post?.description}</h6>
        <h6 className="text-right text-s font-normal text-white">Author: {post.author.name?.slice(0, -10)}</h6>
        <br />
        <div className="sm:w-2/3 md:flex md:w-full md:justify-between">
          <div>
            <TagContainer tags={post.tags} />
          </div>
          <div className="hidden md:flex justify-center p-0.5 bg-white dark:bg-[#4F5159]">
            <VoteButtons
              postId={post.id}
              initialUpvotes={post.upvoteCount}
              initialDownvotes={post.downvoteCount}
              initialUserVote={userVote === 'UPVOTE' ? 'up' : userVote === 'DOWNVOTE' ? 'down' : null}
            />
          </div>
        </div>
        <div className="flex md:hidden justify-center p-0.5 bg-white dark:bg-[#4F5159]">
          <VoteButtons
            postId={post.id}
            initialUpvotes={post.upvoteCount}
            initialDownvotes={post.downvoteCount}
            initialUserVote={userVote === 'UPVOTE' ? 'up' : userVote === 'DOWNVOTE' ? 'down' : null}
          />
        </div>

        <br />
        <NumberOfComments commentArray={post.comments} />
        <CommentField forumPostId={post.id} />
        <CommentContainer comments={post.comments} />
      </div>
    </div>
  );
}

export default ForumPost;
