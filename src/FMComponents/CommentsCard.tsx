
'use client';

import * as React from 'react';
import { InfoCard } from './InfoCard';

const NoCommentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <line x1="8" y1="10" x2="16" y2="10"></line>
    <line x1="8" y1="14" x2="12" y2="14"></line>
  </svg>
);

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1"><path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z"/></svg>
);

const Placeholder = ({ icon, message, details }: { icon: React.ReactNode, message: string, details: string }) => (
  <div className="details-placeholder">
    <div className="details-placeholder-icon">{icon}</div>
    <span className="details-placeholder-message">{message}</span>
    <span className="details-placeholder-details">{details}</span>
  </div>
);

const CommentItem = ({ text, author, time }: { text: string, author: string, time: string }) => (
    <div className="comment-item">
        <div className="comment-author-avatar">{author.charAt(0)}</div>
        <div className="comment-content">
            <div className="comment-header">
                <span className="comment-author">{author}</span>
                <span className="comment-time">{time}</span>
            </div>
            <p className="comment-text">{text}</p>
        </div>
    </div>
);

const SkeletonCommentItem = () => (
    <div className="comment-item animate-pulse">
        <div className="comment-author-avatar bg-gray-300"></div>
        <div className="comment-content">
            <div className="comment-header">
                <div className="bg-gray-300 h-4 w-20 rounded"></div>
                <div className="bg-gray-300 h-3 w-16 rounded"></div>
            </div>
            <div className="bg-gray-300 h-4 w-full mt-2 rounded"></div>
            <div className="bg-gray-300 h-4 w-3/4 mt-1 rounded"></div>
        </div>
    </div>
);


export interface Comment {
    id: number;
    text: string;
    author: string;
    time: string;
}

interface CommentsCardProps {
    title: string;
    comments: Comment[];
    isLoading?: boolean;
    onAddComment: (text: string) => void;
}

/**
 * A generic component for displaying and adding comments.
 */
export function CommentsCard({
    title,
    comments,
    isLoading = false,
    onAddComment
}: CommentsCardProps) {
    const [newComment, setNewComment] = React.useState('');

    const handleSubmit = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    return (
        <InfoCard title={title}>
            <div className="comments-card-container">
                <div className="comment-input-area">
                    <textarea
                        className="comment-textarea"
                        placeholder="Add comments here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        className="comment-add-btn"
                        aria-label="Add comment"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        <AddIcon />
                    </button>
                </div>

                <div className="comments-list">
                    {isLoading ? (
                        <>
                            <SkeletonCommentItem />
                            <SkeletonCommentItem />
                        </>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem key={comment.id} {...comment} />
                        ))
                    ) : (
                        <Placeholder
                            icon={<NoCommentsIcon />}
                            message="No Comments"
                            details="Be the first to add a comment."
                        />
                    )}
                </div>
            </div>
        </InfoCard>
    );
}
