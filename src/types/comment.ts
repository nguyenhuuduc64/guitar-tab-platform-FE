export interface CommentData {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    postId: string;
    userId: string;
    username: string;
    userFullName?: string;
    userImageUrl?: string;
}
