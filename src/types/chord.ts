import { type User } from "./user";
import { type Artist } from "./artist";
export interface Chord {
    id: string;
    title: string;
    slug: string;
    content: string;
    user?: User | null;
    //artist?: Artist | null;
    artistId?: string | null;
    artistName?: string;
    category: string;
    youtubeUrl?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;
}