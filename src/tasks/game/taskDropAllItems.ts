import { Task } from '../task';
import type { Bot } from 'mineflayer';

import { sleep } from '../../util/sleep';

export class TaskDropAllItems extends Task {
  async execute(bot: Bot) {
    const slotsToDrops = [];

    for (let slotId = 0; slotId < bot.inventory.slots.length; slotId++) {
      const slot = bot.inventory.slots[slotId];
      if (!slot) continue;

      slotsToDrops.push(slotId);
    }

    if (!slotsToDrops.length) return;

    if(bot.entity.pitch > -0.49 * Math.PI) {
      await bot.look(0, -0.495 * Math.PI, true);
      await sleep(100);
    }

    for (const slotId of slotsToDrops) {
      bot.windowInteractions.dropStackFromSlot(slotId);
    }
  }
}
