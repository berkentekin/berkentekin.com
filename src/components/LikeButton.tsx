import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
    id: string;
}

interface LikeResponse {
    count: number;
}

export default function LikeButton({ id }: LikeButtonProps) {
    const [likes, setLikes] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const lastScrollY = useRef<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show when at the very top or scrolling up
            if (currentScrollY < 10 || currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
                // Hide when scrolling down and not at top
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Check local storage for liked state
        const isLiked = localStorage.getItem(`liked-${id}`) === 'true';
        setLiked(isLiked);

        // Fetch initial count
        fetch(`/api/likes/${id}`)
            .then(async res => {
                if (!res.ok) throw new Error(res.statusText);
                const data = await res.json() as LikeResponse;
                setLikes(data.count || 0);
            })
            .catch(err => {
                console.error('Error fetching likes:', err);
                // Fallback to 0 likes, but ensure button is shown
                setLikes(0);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleLike = async () => {
        // Optimistic update
        const newLikedState = !liked;
        const newLikesCount = newLikedState ? likes + 1 : Math.max(0, likes - 1);

        setLikes(newLikesCount);
        setLiked(newLikedState);
        localStorage.setItem(`liked-${id}`, String(newLikedState));

        try {
            const res = await fetch(`/api/likes/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newLikedState ? 'like' : 'unlike' })
            });
            if (!res.ok) throw new Error('Failed to update like');
            const data = await res.json() as LikeResponse;
            setLikes(data.count);
        } catch (err) {
            console.error('Error updating like:', err);
            // Revert optimistic update on failure
            setLikes(likes); // Reset to previous count
            setLiked(liked); // Reset to previous state
            localStorage.setItem(`liked-${id}`, String(liked));
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`group flex items-center justify-center gap-1.5 px-2 py-2 rounded-full transition-transform duration-300 fixed bottom-8 right-8 z-50 ${liked
                ? 'text-rose-600'
                : 'text-gray-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400'
                } ${isVisible ? 'translate-y-0' : 'translate-y-[200%] md:translate-y-0'}`}
            aria-label={liked ? "Unlike this story" : "Like this story"}
        >
            <Heart
                size={24}
                className={`drop-shadow-sm ${liked ? 'fill-rose-600' : 'group-hover:fill-rose-500/10'
                    }`}
                strokeWidth={2}
            />
            <span className="font-medium font-serif text-sm drop-shadow-sm shadow-black/50 tabular-nums min-w-[0.8rem] text-center">{likes}</span>
        </button>
    );
}
