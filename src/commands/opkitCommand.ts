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
          for (let slot = 0; slot < chest.inventoryStart; slot++) {
            try {
              await bot.windowInteractions.shiftLeftClick(slot);
            } catch (err) {
              console.log('transaction failed');
            }
            await sleep(20);
          }

          chest.close();
        }),
      ]),
    }
  },
});
