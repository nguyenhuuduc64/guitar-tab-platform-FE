import { type User } from "./user";

export interface Chord {
    id: string;
    title: string;
    slug: string;
    content: string;
    user?: User | null;
    userId?: string;
    artistId?: string | null;
    artistName?: string;
    category?: string | any;
    categoryId?: string;
    categoryName?: string;
    youtubeUrl?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;
    audio?: {
        id: string;
        url: string;
        chordId: string;
    } | null;
}