import type { Chest as ChestInfo } from '../../../config';

declare module 'mineflayer' {
  interface Bot {
    kitStore: {
      chests: ChestInfo[];
      defaultChest: ChestInfo;

      pendingRequests: Set<string>;
      totalRequests: Map<string, number>;

      giveKit: (username: string, kitName?: string) => Promise<void>;
      grabKit: (chestInfo: ChestInfo, amount?: number) => Promise<void>;
    }
  }
}
