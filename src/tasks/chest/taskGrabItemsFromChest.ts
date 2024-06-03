import { Task } from '../task';
import type { Bot, Chest } from 'mineflayer';

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
      console.error('no targetItem in chest, is the chest empty?');
      throw new ItemOutOfStockError('item out of stock');
    }

    // @ts-ignore wrong nbt types
    const targetItemName: string | undefined = targetItem?.nbt?.value?.display?.value?.Name?.value;

    let matchingItemsInInventory = bot.inventory.slots.filter((inventoryItem) => {
      if (!inventoryItem) return false;

      if (inventoryItem.type !== targetItem.type) return false;
      if (inventoryItem.metadata !== targetItem.metadata) return false;

      if (targetItem.nbt) {
        if (!inventoryItem.nbt) return false;
        // @ts-ignore wrong nbt types
        const inventoryItemName: string | undefined = inventoryItem?.nbt?.value?.display?.value?.Name?.value;

        if (inventoryItemName !== targetItemName) return false;
      }

      return true;
    }).length;

    console.log('grabbing item from chest with name', targetItemName, ', already', matchingItemsInInventory, 'items in inventory');

    try {
      if (this.amount - matchingItemsInInventory <= 0) console.log('kit already in inventory, not grabbing');

      const slotIds: number[] = [];
      for (const [slotId, slot] of chest.slots.entries()) {
        if (!slot) continue;
        if (slotId >= chest.inventoryStart) continue;

        slotIds.push(slotId);
      }

      while (this.amount - matchingItemsInInventory > 0) {
        if (!slotIds.length) {
          console.warn('no slots left in chest to grab item from, aborting');
        }

        const slotId = slotIds.shift()!;
        await bot.windowInteractions.shiftLeftClick(slotId)
          .catch(() => console.error('shiftLeftClick threw exception'));

        matchingItemsInInventory += 1;
      }
    } catch (err) {
      console.error('failed to grab item from chest in loop');
      console.error(err);
    }
  }
}
