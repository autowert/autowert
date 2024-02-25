import { TPCommand } from './TPCommand';

import { sleep } from '../util/sleep';
import { TaskList } from '../tasks/taskList';
import { TaskEnsureNearBlock } from '../tasks/chest/taskEnsureNearBlock';
import { TaskCustomFunction } from '../tasks/taskCustomFunction';

import { opKitChestPositions } from '../../config';

export const opKitCommand = new TPCommand({
  name: 'opkit',
  description: 'Gives you a kit of your choice up to 36 times.',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: ({ args }) => {
    const kit = args[0].toLowerCase();
    const chestPos = opKitChestPositions[kit];

    if (!kit || !chestPos) {
      return {
        success: false,
        chatResponse: 'usage: opkit <kitName>',
      };
    }

    return {
      beforeTPTask: new TaskList([
        new TaskEnsureNearBlock(chestPos, 5.5),
        new TaskCustomFunction(async (bot) => {
          const chestBlock = bot.blockAt(chestPos);
          if (!chestBlock) return;

          const chest = await bot.openChest(chestBlock);

          let chestItemCount = 0;
          let inventoryFreeCount = 0;

          for (let slotId = 0; slotId < chest.slots.length; slotId++) {
            const slot = chest.slots[slotId];

            if (slotId < chest.inventoryStart && slot) chestItemCount++;
            if (slotId >= chest.inventoryStart && slotId <= chest.inventoryEnd && !slot) inventoryFreeCount++;
          }

          console.log('opkit: found %d items in chest and %d free slots in inventory', chestItemCount, inventoryFreeCount);

          for (let slotId = 0; slotId < chest.inventoryStart; slotId++) {
            const slot = chest.slots[slotId];
            if (!slot) continue;

            bot.windowInteractions.shiftLeftClick(slotId)

            chestItemCount--;
            inventoryFreeCount--;

            if (!chestItemCount || !inventoryFreeCount) break;

            // await sleep(25);
          }

          console.log('opkit: after moving %d items in chest and %d free slots in inventory', chestItemCount, inventoryFreeCount);

          await sleep(25);
          chest.close();
        }),
      ]),
    }
  },
});
