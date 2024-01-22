import { TPCommand } from './TPCommand';

import { sleep } from '../util/sleep';
import { TaskCustomFunction } from '../tasks/taskCustomFunction';
import { TaskEnsureNearBlock } from '../tasks/chest/taskEnsureNearBlock';
import { TaskTryBuildPortal } from '../tasks/game/taskTryBuildPortal';

import { itemChestPositions } from '../../config';

export const portalCommand = new TPCommand({
  name: 'portal',
  description: 'Teleports to you and attempts to build a nether portal.',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: () => ({
    beforeTPTask: new TaskCustomFunction(async (bot) => {
      for (const itemChestPosition of [itemChestPositions.obsidian, itemChestPositions.flint_and_steel]) {
        await new TaskEnsureNearBlock(itemChestPosition, 5.5).execute(bot);

        const chestBlock = bot.blockAt(itemChestPosition)!;
        const chest = await bot.openChest(chestBlock);

        const itemSlot = chest.slots.findIndex((item, slot) => {
          if (!item) return;
          if (slot >= chest.inventoryStart) return;

          if (item) return true;
        });

        try {
          await bot.windowInteractions.shiftLeftClick(itemSlot);
        } catch (err) {
          console.log('portal: shift left click failed', err);
        }

        await chest.close();
        await sleep(100);
      }
    }),
    TPYTask: new TaskTryBuildPortal(),
  }),
});
