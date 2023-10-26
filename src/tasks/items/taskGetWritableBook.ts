import { Task } from '../task';

import type { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';

import { sleep } from '../../util/sleep';

import { bookMaterialsChestPosition } from '../../../config';

export class TaskGetWritableBook extends Task {
  private materialsChestPosition: Vec3;

  constructor(materialsChestPosition = bookMaterialsChestPosition) {
    super();

    this.materialsChestPosition = materialsChestPosition;
  }

  async execute(bot: Bot) {
    const hasWritableBook = bot.inventory.slots.some(item => item && item.name === 'writable_book');
    if (hasWritableBook) return console.log('bot already has writable book in inventory');

    const chestPos = this.materialsChestPosition;

    const chestBlock = bot.blockAt(chestPos);
    if (!chestBlock) throw new Error('book chest block not found');

    const chest = await bot.openChest(chestBlock);

    let featherSlot: number | null = null;
    let inkSlot: number | null = null;
    let bookSlot: number | null = null;
    for (const [slot, item] of chest.slots.entries()) {
      if (!item) continue;
      if (slot >= chest.inventoryStart) continue;

      if (featherSlot === null && item.name === 'feather') featherSlot = slot;
      if (inkSlot === null && item.type === 351 && item.metadata === 0) inkSlot = slot;
      if (bookSlot === null && item.name === 'book') bookSlot = slot;
    }
    if (featherSlot === null) throw new Error('no slot with feather');
    if (inkSlot === null) throw new Error('no slot with ink');
    if (bookSlot === null) throw new Error('no slot with book');

    const emptyInventorySlots: number[] = [];
    for (let inventorySlot = 9; inventorySlot <= 44; inventorySlot++) {
      const actualSlot = chest.inventoryStart + inventorySlot - 9;
      if (chest.slots[actualSlot] === null) emptyInventorySlots.push(inventorySlot);
    }
    if (emptyInventorySlots.length < 3) throw new Error('not enough empty inventory slots');

    const ingredientSlots: number[] = [];
    for (const slot of [featherSlot, inkSlot, bookSlot]) {
      const item = chest.slots[slot]!;

      const emptyInventorySlot = emptyInventorySlots.shift()!;
      ingredientSlots.push(emptyInventorySlot);

      await bot.windowInteractions.leftClick(slot);
      await bot.windowInteractions.rightClick(chest.inventoryStart + emptyInventorySlot - 9);
      if (item.count > 1) await bot.windowInteractions.leftClick(slot);

      await sleep(10);
    }

    await chest.close();

    for (const [craftingSlot, ingredientSlot] of ingredientSlots.entries()) {
      await bot.windowInteractions.leftClick(ingredientSlot);
      await bot.windowInteractions.leftClick(craftingSlot + 1);
      await sleep(10);
    }

    const writableBookSlot = ingredientSlots.at(0)!; // the ingredient is no longer there
    await bot.windowInteractions.leftClick(0 /* crafting result */);
    await bot.windowInteractions.leftClick(writableBookSlot);
  }
}
