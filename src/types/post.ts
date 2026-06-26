import { type Chord } from "./chord";
import { type AudioItem } from "./audio";

export interface PostData {
    id: string;
    content: string;
    userId: string;
    username: string;
    fullName?: string;
    userImage?: string;
    audio?: AudioItem | null;
    chord?: Chord | null;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}
