import { Task } from '../task';
import type { Bot, Chest } from 'mineflayer';

import getChatMessage from 'prismarine-chat';
import { logger } from '../../util/logger';

export class ItemOutOfStockError extends Error { }

export class TaskGrabItemsFromChest extends Task {
  protected amount: number;

  constructor(amount: number) {
    super();

    this.amount = amount;
  }

  async execute(bot: Bot) {
    const chest = bot.currentWindow as Chest | null;
    if (!chest) {
      throw new Error('no chest open');
    }

    const targetItem = chest.slots.find((item) => item !== null);
    if (!targetItem) {
      logger.info('No targetItem in chest, it is empty');
      throw new ItemOutOfStockError('item out of stock');
    }

    const ChatMessage = getChatMessage(bot.version);

    // @ts-ignore wrong nbt types
    const targetItemNameRaw: string | undefined = targetItem?.nbt?.value?.display?.value?.Name?.value;

    const targetItemName = targetItemNameRaw?.startsWith('{')
      ? new ChatMessage(JSON.parse(targetItemNameRaw)).toString()
      : targetItemNameRaw ?? '<unknown name>';

    let matchingItemsInInventory = bot.inventory.slots.filter((inventoryItem) => {
      if (!inventoryItem) return false;

      if (inventoryItem.type !== targetItem.type) return false;
      if (inventoryItem.metadata !== targetItem.metadata) return false;

      if (targetItem.nbt) {
        if (!inventoryItem.nbt) return false;
        // @ts-ignore wrong nbt types
        const inventoryItemName: string | undefined = inventoryItem?.nbt?.value?.display?.value?.Name?.value;

        if (inventoryItemName !== targetItemNameRaw) return false;
      }

      return true;
    }).length;

    logger.info({ targetItemName, matchingItemsInInventory, targetAmount: this.amount }, 'Grabbing item(s) from chest');

    try {
      if (this.amount - matchingItemsInInventory <= 0) logger.debug('Kit already in inventory, not grabbing');

      const slotIds: number[] = [];
      for (const [slotId, slot] of chest.slots.entries()) {
        if (!slot) continue;
        if (slotId >= chest.inventoryStart) continue;

        slotIds.push(slotId);
      }

      while (this.amount - matchingItemsInInventory > 0) {
        if (!slotIds.length) {
          logger.warn('No more items in the chest, aborting');
          break;
        }

        const slotId = slotIds.shift()!;
        await bot.windowInteractions.shiftLeftClick(slotId)
          .catch((err) => logger.debug({ err }, 'Grab item from chest threw error'));

        matchingItemsInInventory += 1;
      }
    } catch (err) {
      logger.error({ err }, 'Failed to grab item from chest in loop');
    }
  }
}
