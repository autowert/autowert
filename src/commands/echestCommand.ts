import { TPCommand } from './TPCommand';

import { TaskCustomFunction } from '../tasks/taskCustomFunction';
import { TaskEnsureNearBlock } from '../tasks/chest/taskEnsureNearBlock';
import { TaskPlaceEchest } from '../tasks/game/taskPlaceEchest';

import { itemChestPositions } from '../../config';

export const echestCommand = new TPCommand({
  name: 'echest',
  description: 'Teleports to you and places an ender chest.',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: () => ({
    beforeTPTask: new TaskCustomFunction(async (bot) => {
      const echestItemChestPosition = itemChestPositions.ender_chest;

      await new TaskEnsureNearBlock(echestItemChestPosition, 5.5).execute(bot);
      const chestBlock = bot.blockAt(echestItemChestPosition)!;
      const chest = await bot.openChest(chestBlock);

      const itemSlot = chest.slots.findIndex((item, slot) => {
        if (!item) return;
        if (slot >= chest.inventoryStart) return;

        if (item) return true;
      });

      try {
        await bot.windowInteractions.shiftLeftClick(itemSlot);
      } catch (err) {
        console.log('echest: shift left click failed', err);
      }

      await chest.close();
    }),
    TPYTask: new TaskPlaceEchest(),
  }),
});
