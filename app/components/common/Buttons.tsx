"use client"
import { useState, useEffect, useCallback } from "react";
import { upvotePost, downvotePost } from '@/app/actions/forumVote';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
    postId: string;
    initialVoteStatus: boolean;
    initialVoteCount: number;
    oppositeVoteCount: number;
    setOppositeVoteCount: (count: number) => void;
    setOppositeVoteStatus: (status: boolean) => void;
}

export function LikeButton({ postId, initialVoteStatus, initialVoteCount, oppositeVoteCount, setOppositeVoteCount, setOppositeVoteStatus }: VoteButtonProps) {
    const [voteStatus, setVoteStatus] = useState<boolean>(initialVoteStatus);
    const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        setVoteStatus(initialVoteStatus);
        setVoteCount(initialVoteCount);
    }, [initialVoteStatus, initialVoteCount]);

    const handleClick = useCallback(async () => {
        if (isLocked) return;
        setIsLocked(true);

        const newVoteStatus = !voteStatus;
        const newVoteCount = newVoteStatus ? voteCount + 1 : Math.max(0, voteCount - 1);
        const newOppositeVoteCount = newVoteStatus ? Math.max(0, oppositeVoteCount - 1) : oppositeVoteCount;

        setVoteStatus(newVoteStatus);
        setVoteCount(newVoteCount);
        setOppositeVoteCount(newOppositeVoteCount);
        setOppositeVoteStatus(false);

        try {
            const result = await upvotePost(postId);
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            setVoteStatus(voteStatus);
            setVoteCount(voteCount);
            setOppositeVoteCount(oppositeVoteCount);
            console.error(error);
        } finally {
            setIsLocked(false);
            router.refresh(); // Revalidate the page in the background
        }
    }, [isLocked, voteStatus, voteCount, oppositeVoteCount, postId, setOppositeVoteCount, setOppositeVoteStatus, router]);

    return (
        <div className="flex gap-1 p-1">
            <button
                onClick={handleClick}
                className={`relative flex items-center justify-center transition-colors duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-white/20 ${voteStatus ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                title="Like"
                disabled={isLocked}
            >
                <Image src="/comment/ThumbsUpIcon.svg" alt="Thumb Up" width={21} height={21} className={`w-6 h-6 ${voteStatus ? 'text-blue-500' : 'text-gray-500'}`} />
            </button>
            {voteCount}
        </div>
    );
}

export function DislikeButton({ postId, initialVoteStatus, initialVoteCount, oppositeVoteCount, setOppositeVoteCount, setOppositeVoteStatus }: VoteButtonProps) {
    const [voteStatus, setVoteStatus] = useState<boolean>(initialVoteStatus);
    const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        setVoteStatus(initialVoteStatus);
        setVoteCount(initialVoteCount);
    }, [initialVoteStatus, initialVoteCount]);

    const handleClick = useCallback(async () => {
        if (isLocked) return;
        setIsLocked(true);

        const newVoteStatus = !voteStatus;
        const newVoteCount = newVoteStatus ? voteCount + 1 : Math.max(0, voteCount - 1);
        const newOppositeVoteCount = newVoteStatus ? Math.max(0, oppositeVoteCount - 1) : oppositeVoteCount;

        // Optimistic update
        setVoteStatus(newVoteStatus);
        setVoteCount(newVoteCount);
        setOppositeVoteCount(newOppositeVoteCount);
        setOppositeVoteStatus(false);

        try {
            const result = await downvotePost(postId);
            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            setVoteStatus(voteStatus);
            setVoteCount(voteCount);
            setOppositeVoteCount(oppositeVoteCount);
            console.error(error);
        } finally {
            setIsLocked(false);
            router.refresh();
        }
    }, [isLocked, voteStatus, voteCount, oppositeVoteCount, postId, setOppositeVoteCount, setOppositeVoteStatus, router]);

    return (
        <div className="flex gap-1 p-1">
            <button
                onClick={handleClick}
                className={`relative flex items-center justify-center transition-colors duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-white/20 ${voteStatus ? 'bg-red-200 dark:bg-red-800' : ''}`}
                title="Dislike"
                disabled={isLocked}
            >
                <Image src="/comment/ThumbsDownIcon.svg" alt="Thumb Down" width={20} height={20} className={`w-6 h-6 ${voteStatus ? 'text-red-500' : 'text-gray-500'}`} />
            </button>
            {voteCount}
        </div>
    );
}
