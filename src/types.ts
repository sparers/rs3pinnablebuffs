import type { ImgRef } from 'alt1';

export interface BuffData {
    name: string;
    image: any;
    threshold: number;
    path: string;
}

export interface BuffCacheEntry {
    name: string;
    imagePath: string;
    buffCooldown: number;
    inactive: boolean;
    lastUpdate: number;
    progress: number;
    initialBuffCooldown: number;
    isPinned: boolean;
    isAudioQueued: boolean;
    cooldown: number;
    cooldownProgress: number;
    initialiCooldown: number
    order: number;
}

export interface PersistedBuff {
    name: string;
    isPinned: boolean;
    isAudioQueued: boolean;
    order?: number;
    imagePath?: string;
}

export interface OverlayPosition {
    x: number;
    y: number;
}

export type ImageCollection = Record<string, ImgRef>;
