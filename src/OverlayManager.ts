import * as a1lib from 'alt1';
import * as htmlToImage from 'html-to-image';
import { LocalStorageHelper } from './LocalStorageHelper';
import type { OverlayPosition } from './types';

interface OverlayRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class OverlayManager {

  private readonly placeholderSuffix = '-placeholder';

  constructor(private readonly storage: LocalStorageHelper) { }

  public setOverlayPosition = (overlayPositionKey: string, onPositionSaved?: () => void): void => {
    a1lib.once('alt1pressed', () => {
      try {
        const mousePos = a1lib.getMousePosition();
        this.storage.save<OverlayPosition>(overlayPositionKey, {
          x: Math.floor(mousePos.x),
          y: Math.floor(mousePos.y)
        });

        if (onPositionSaved) {
          onPositionSaved();
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  public startPositionTracking = (group: string, label: string, intervalMs: number): number => {
    const placeholderGroup = this.getPlaceholderGroupName(group);

    return window.setInterval(() => {
      const mousePos = a1lib.getMousePosition();

      alt1.overLayClearGroup(placeholderGroup);
      alt1.overLaySetGroup(placeholderGroup);
      alt1.overLayTextEx(
        `Press Alt+1 to set the ${label} group position.`,
        a1lib.mixColor(255, 255, 255),
        18,
        mousePos.x,
        mousePos.y,
        9999,
        '',
        true,
        true
      );
    }, intervalMs);
  };

  public stopPositionTracking = (group: string, intervalId: number): void => {
    window.clearInterval(intervalId);
    alt1.overLayClearGroup(this.getPlaceholderGroupName(group));
  };

  public highlightCaptureArea = (rect: OverlayRect, durationMs = 3000, group = 'buffsCaptureArea'): void => {
    alt1.overLaySetGroup(group);
    alt1.overLayRect(
      a1lib.mixColor(120, 255, 120),
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      durationMs,
      1
    );

    window.setTimeout(() => {
      alt1.overLayClearGroup(group);
    }, durationMs + 1000);
  };

  public captureOverlay = async (group: string, element: HTMLElement, scale: number): Promise<void> => {
    try {
      const style = getComputedStyle(element);
      const canvas = await htmlToImage.toCanvas(element, {
        width: parseInt(style.width) || 1,
        height: parseInt(style.height) || 1,
        quality: 1,
        pixelRatio: scale,
        imagePlaceholder:
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%23ddd"/><text x="16" y="16" text-anchor="middle" dy=".3em" font-size="10" fill="%23999">?</text></svg>',
        style: {
          transform: 'none',
          left: '0',
          top: '0',
          position: 'static'
        }
      });

      const overlayPosition = this.storage.get<OverlayPosition>(group);
      if (!overlayPosition) return;

      const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);

      alt1.overLaySetGroup(group);
      alt1.overLayFreezeGroup(group);
      alt1.overLayClearGroup(group);
      alt1.overLayImage(
        overlayPosition.x,
        overlayPosition.y,
        a1lib.encodeImageString(imageData),
        imageData.width,
        150
      );
      alt1.overLayRefreshGroup(group);
    } catch (error) {
      console.error(error);
    }
  };

  public captureElementAsOverlay = async (elementId: string, overlayGroup: string, scale: number): Promise<void> => {
    const container = document.getElementById(elementId) as HTMLElement | null;
    if (!container) return;

    const sanitizedHtml = this.stripAlpine(container.outerHTML);
    const readyToCapture = document.createElement('div');
    readyToCapture.innerHTML = sanitizedHtml;
    readyToCapture.style.position = 'absolute';
    readyToCapture.style.top = '0';
    readyToCapture.style.left = '-9999px';
    readyToCapture.querySelectorAll('.exclude-me').forEach(el => el.remove());

    document.body.appendChild(readyToCapture);

    await this.waitForImages(readyToCapture);
    await this.captureOverlay(overlayGroup, readyToCapture, scale);

    readyToCapture.remove();
  };

  public clearOverlay(group: string) {
    alt1.overLayClearGroup(group);
    alt1.overLayRefreshGroup(group);
  }

  private waitForImages = async (container: HTMLElement): Promise<void> => {
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    if (images.length === 0) {
      return;
    }

    await Promise.all(
      images.map(image => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>(resolve => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      })
    );
  };

  private stripAlpine = (html: string): string => {
    return html
      .replace(/<template[^>]*>[\s\S]*?<\/template>/gi, '')
      .replace(/\s+(x-[a-z:-]+|:[a-z-]+|@[a-z.-]+)(="[^"]*")?/gi, '');
  };

  private getPlaceholderGroupName = (group: string): string => `${group}${this.placeholderSuffix}`;
}
