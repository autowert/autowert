import { TPCommand } from './TPCommand';
import { logger } from '../util/logger';

import { type Chest } from 'mineflayer';
import { sleep } from '../util/sleep';
import { TaskList } from '../tasks/taskList';
import { TaskEnsureNearBlock } from '../tasks/chest/taskEnsureNearBlock';
import { TaskCustomFunction } from '../tasks/taskCustomFunction';
import { TaskOpenChest } from '../tasks/chest/taskOpenChest';
import { TaskDropAllItems } from '../tasks/game/taskDropAllItems';

import { opKitChestPositions } from '../../config';

export const opKitCommand = new TPCommand({
  name: 'opkit',
  description: 'Gives you a kit of your choice up to 36 times.',
  usage: '<kitId> [--back=<username>] [--limit=<count>]',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: ({ bot, args, flags }) => {
    const kit = args[0].toLowerCase();
    const chestPos = opKitChestPositions[kit];

    if (!kit || !chestPos) {
      return {
        success: false,
        chatResponse: 'usage: opkit <kitName>',
      };
    }

    const { back } = flags;
    const shouldTpBack = typeof back === 'string' && back in bot.players;

    const limit = 'limit' in flags ? +flags.limit : false;

    return {
      beforeTPTask: new TaskList([
        new TaskEnsureNearBlock(chestPos, 5.5),
        new TaskCustomFunction(async (bot) => {
          await new TaskOpenChest(chestPos).execute(bot);
          const chest = bot.currentWindow! as Chest;

          let chestItemCount = 0;
          let inventoryFreeCount = 0;

          for (let slotId = 0; slotId < chest.slots.length; slotId++) {
            const slot = chest.slots[slotId];

            if (slotId < chest.inventoryStart && slot) chestItemCount++;
            if (slotId >= chest.inventoryStart && slotId <= chest.inventoryEnd && !slot) inventoryFreeCount++;
          }

          if (limit)
            chestItemCount = Math.min(chestItemCount, limit); // limit to amount of single chest

          logger.debug({ chestItemCount, inventoryFreeCount }, 'Analyzed chest and inventory for opkit');

          for (let slotId = 0; slotId < chest.inventoryStart; slotId++) {
            const slot = chest.slots[slotId];
            if (!slot) continue;

            bot.windowInteractions.shiftLeftClick(slotId)

            chestItemCount--;
            inventoryFreeCount--;

            if (!chestItemCount || !inventoryFreeCount) break;

            // await sleep(25);
          }

          logger.debug({ chestItemCount, inventoryFreeCount }, 'Done moving items from chest to inventory for opkit');

          await sleep(25);
          chest.close();
        }),
      ]),

      chatResponse: !shouldTpBack && back ? 'Player not found' : undefined,

      TPYTask: !shouldTpBack
        ? undefined
        : new TaskCustomFunction(async (bot) => {
          await sleep(2500);

          // drop all items
          await new TaskDropAllItems().execute(bot);

          await sleep(150);

          bot.TPYTask.set(back, new TaskCustomFunction(() => new Promise(() => { })));
          bot.chat(`/tpa ${back}`);

          return new Promise<void>(() => { }); // never resolve
        }),
    };
  },
});
