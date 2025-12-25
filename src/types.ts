import type { ImgRef } from 'alt1';

export interface BuffData {
    name: string;
    image: any;
    threshold: number;
    path: string;
    debug?: boolean;
    abilityCooldown: number;
    hasAbilityCooldown: boolean;
}

export interface BuffCacheEntry {
    name: string;
    imagePath: string;
    buffDuration: number;
    lastUpdate: number;
    buffProgress: number;
    buffDurationMax: number;
    isPinned: boolean;
    isAudioQueued: boolean;
    abilityCooldown: number;
    abilityCooldownProgress: number;
    abilityCooldownMax: number;
    hasAbilityCooldown: boolean;
    order: number;
}

export interface PersistedBuff {
    name: string;
    isPinned: boolean;
    isAudioQueued: boolean;
    order?: number;
    imagePath?: string;
    abilityCooldown?: number;
    abilityCooldownProgress?: number;
    abilityCooldownMax?: number;
    hasAbilityCooldown: boolean
}

export interface OverlayPosition {
    x: number;
    y: number;
}

export interface OverlaySettings {
    scale: number;
    buffDurationAlertThreshold: number;
    abilityCooldownAlertThreshold: number;
}

export type ImageCollection = Record<string, ImgRef>;
