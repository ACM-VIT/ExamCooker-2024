'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient, VoteType } from '@prisma/client';
import { auth } from '../auth';
const prisma = new PrismaClient();

export async function upvotePost(postId: string) {
    let session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existingVote = await tx.vote.findUnique({
                where: {
                    userId_forumPostId: {
                        userId: userId,
                        forumPostId: postId,
                    },
                },
            });

            let updatedVoteStatus = null;
            let updatedPost = null;

            if (existingVote) {
                if (existingVote.type === VoteType.UPVOTE) {
                    await tx.vote.delete({
                        where: { id: existingVote.id },
                    });
                    updatedVoteStatus = null;
                    updatedPost = await tx.forumPost.update({
                        where: { id: postId },
                        data: { upvoteCount: { decrement: 1 } },
                    });
                } else {
                    await tx.vote.update({
                        where: { id: existingVote.id },
                        data: { type: VoteType.UPVOTE },
                    });
                    updatedVoteStatus = { ...existingVote, type: VoteType.UPVOTE };
                    updatedPost = await tx.forumPost.update({
                        where: { id: postId },
                        data: {
                            upvoteCount: { increment: 1 },
                            downvoteCount: { decrement: 1 },
                        },
                    });
                }
            } else {
                const newVote = await tx.vote.create({
                    data: {
                        userId: userId,
                        forumPostId: postId,
                        type: VoteType.UPVOTE,
                    },
                });
                updatedVoteStatus = newVote;
                updatedPost = await tx.forumPost.update({
                    where: { id: postId },
                    data: { upvoteCount: { increment: 1 } },
                });
            }

            return { updatedPost, updatedVoteStatus };
        });

        revalidatePath(`/forum/${postId}`);
        return { success: true, upvoteCount: result.updatedPost.upvoteCount, downvoteCount: result.updatedPost.downvoteCount, voteStatus: result.updatedVoteStatus };
    } catch (error) {
        console.error('Error upvoting post:', error);
        return { success: false, error: 'Failed to upvote post' };
    }
}

export async function downvotePost(postId: string) {
    let session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existingVote = await tx.vote.findUnique({
                where: {
                    userId_forumPostId: {
                        userId: userId,
                        forumPostId: postId,
                    },
                },
            });

            let updatedVoteStatus = null;
            let updatedPost = null;

            if (existingVote) {
                if (existingVote.type === VoteType.DOWNVOTE) {
                    await tx.vote.delete({
                        where: { id: existingVote.id },
                    });
                    updatedVoteStatus = null;
                    updatedPost = await tx.forumPost.update({
                        where: { id: postId },
                        data: { downvoteCount: { decrement: 1 } },
                    });
                } else {
                    await tx.vote.update({
                        where: { id: existingVote.id },
                        data: { type: VoteType.DOWNVOTE },
                    });
                    updatedVoteStatus = { ...existingVote, type: VoteType.DOWNVOTE };
                    updatedPost = await tx.forumPost.update({
                        where: { id: postId },
                        data: {
                            upvoteCount: { decrement: 1 },
                            downvoteCount: { increment: 1 },
                        },
                    });
                }
            } else {
                const newVote = await tx.vote.create({
                    data: {
                        userId: userId,
                        forumPostId: postId,
                        type: VoteType.DOWNVOTE,
                    },
                });
                updatedVoteStatus = newVote;
                updatedPost = await tx.forumPost.update({
                    where: { id: postId },
                    data: { downvoteCount: { increment: 1 } },
                });
            }

            return { updatedPost, updatedVoteStatus };
        });
        revalidatePath(`/forum/${postId}`);

        return { success: true, upvoteCount: result.updatedPost.upvoteCount, downvoteCount: result.updatedPost.downvoteCount, voteStatus: result.updatedVoteStatus };
    } catch (error) {
        console.error('Error downvoting post:', error);
        return { success: false, error: 'Failed to downvote post' };
    }
}
