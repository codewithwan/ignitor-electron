export interface Game {
    id: number;
    title: string;
    description: string;
    color: string;
    bgImage: string;
    icon: string;
    playTime: Record<string, number>;
    totalPlayTime?: number;
    lastPlayed?: string;
} 