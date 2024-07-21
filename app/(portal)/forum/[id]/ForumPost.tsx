"use client"
import React, { useState } from 'react';
import TagContainer from "@/app/components/forumpost/TagContainer";
import CommentField from "@/app/components/forumpost/CommentField";
import CommentContainer from "@/app/components/forumpost/CommentContainer";
import { NumberOfComments } from "@/app/components/forumpost/CommentContainer";
import { DislikeButton, LikeButton } from "@/app/components/common/Buttons";
import { Tag, Comment, ForumPost, Prisma, VoteType } from "@prisma/client";
import ForumPostGetPayload = Prisma.ForumPostGetPayload;

interface ForumPostProps {
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
        },
    }>
    tagArray: Tag[] | undefined;
    commentArray: Comment[] | undefined;
    initialLikeStatus: boolean;
    initialDislikeStatus: boolean;
}

function ForumPostPage({ post, tagArray, commentArray, initialLikeStatus, initialDislikeStatus }: ForumPostProps) {
    const [upvoteCount, setUpvoteCount] = useState(post?.upvoteCount ?? 0);
    const [downvoteCount, setDownvoteCount] = useState(post?.downvoteCount ?? 0);
    const [isLiked, setIsLiked] = useState(initialLikeStatus);
    const [isDisliked, setIsDisliked] = useState(initialDislikeStatus);

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <div className="transition-colors w-full h-full p-6 text-black dark:text-[#D5D5D5]">
            <div className="bg-[#82BEE9] dark:bg-[#232530] p-4 md:p-10">
                <h2 className="font-extrabold">{post.title}</h2>
                <hr className="border-0 h-px my-5 bg-black" />
                <h6>{post.description}</h6>
                <br />
                <div className="sm:w-2/3 md:flex md:w-full md:justify-between">
                    <div>
                        <TagContainer tags={tagArray} />
                    </div>
                    <div className="hidden md:flex justify-center p-0.5 bg-white dark:bg-[#4F5159]">
                        <LikeButton
                            postId={post.id}
                            initialVoteStatus={isLiked}
                            initialVoteCount={upvoteCount}
                            oppositeVoteCount={downvoteCount}
                            setOppositeVoteCount={setDownvoteCount}
                            setOppositeVoteStatus={setIsDisliked}
                        />
                        <DislikeButton
                            postId={post.id}
                            initialVoteStatus={isDisliked}
                            initialVoteCount={downvoteCount}
                            oppositeVoteCount={upvoteCount}
                            setOppositeVoteCount={setUpvoteCount}
                            setOppositeVoteStatus={setIsLiked}
                        />
                    </div>
                </div>
                <br />
                <NumberOfComments commentArray={commentArray} />
                <CommentField forumPostId={post.id} />
                <CommentContainer comments={commentArray} />
            </div>
        </div>
    );
}

export default ForumPostPage;
