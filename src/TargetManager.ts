import * as a1lib from 'alt1';
import * as TargetMob from 'alt1/targetmob';
import { BuffImageRegistry } from './BuffImageRegistry';

export class TargetManager {
  private readonly targetMob = new TargetMob.default();

  public getTargetDebuffs = (trackedTargetDebuffs: Record<string, boolean>) => {
    const hasTarget = this.targetMob.read();

    if (!hasTarget) {
      return [];
    }

    const targetPos = this.targetMob.lastpos;
    if (!targetPos) {
      return [];
    }

    const targetLocation = {
      x: targetPos.x - 120,
      y: targetPos.y + 25,
      w: 150,
      h: 60
    };

    const capturedArea = a1lib.captureHold(
      targetLocation.x,
      targetLocation.y,
      targetLocation.w,
      targetLocation.h
    );

    const targetDebuffsData = BuffImageRegistry.buffData.filter(buff =>
      buff.isTarget &&
      trackedTargetDebuffs[buff.name.charAt(0).toLowerCase() + buff.name.slice(1).replace(/\s+/g, '')]
    );

    return targetDebuffsData.map(debuff => {
      const isPresent = debuff.image ? capturedArea.findSubimage(debuff.image).length > 0 : false;
      return {
        ...debuff,
        abilityCooldown: isPresent ? 1 : 0
      };
    });
  };
}
