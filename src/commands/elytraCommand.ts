import { TPCommand } from './TPCommand';
import { logger } from '../util/logger';

import { TaskGrabItemsFromChestAndClose } from '../tasks/chest/taskGrabItemsFromChestAndClose';
import { TaskDropAllItems } from '../tasks/game/taskDropAllItems';

import { itemChestPositions } from '../../config';

export const elytraCommand = new TPCommand({
  name: 'elytra',
  description: 'Teleports to you with an elytra.',
  usage: '',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: async () => {
    const chestPos = itemChestPositions.elytra;
    if (!chestPos) {
      logger.warn({ chestPos }, 'Chest position for elytra command not specified');
      return { success: false };
    }

    return {
      beforeTPTask: new TaskGrabItemsFromChestAndClose(chestPos),
      TPYTask: new TaskDropAllItems(true),
    };
  },
});
