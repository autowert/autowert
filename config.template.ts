import { Vec3 } from 'vec3';
import * as CU from './src/util/configUtils';

import { TaskGrabItemsFromChestAndClose } from './src/tasks/chest/taskGrabItemsFromChestAndClose';
import { TaskList } from './src/tasks/taskList';
import { TaskGetWritableBook } from './src/tasks/items/taskGetWritableBook';
import { TaskRandom } from './src/tasks/taskRandom';

export const prefix = CU.definePrefix('?');
export const discordInvite = CU.defineDiscordInvite(false);

export const notificationOptions = CU.defineNotifications({
  enabled: false,
  // instance: 'https://ntfy.sh/',
  // topic: 'example-bot-topic',
});

// credentials for the dashboard, only to be used as the last resort
export const dashboardOptions = CU.defineDashboard({
  enabled: false,
  // username: 'user',
  // password: '1234',
});

const baseChest = new Vec3(0, 0, 0);
const getPosition = CU.getPositionFacotry(baseChest, [1, 0, 0]);
const getPosition2 = CU.getPositionFacotry(baseChest.offset(0, 0, 3), [1, 0, 0]);

// shulker, chest or double chest with feathers, ink sacks and books
export const bookMaterialsChestPosition = getPosition(0, -2).offset(1, 0, 0);

// chests containing only the item
export const itemChestPositions = {
  obsidian: getPosition(-1, 0),
  flint_and_steel: getPosition(-1, 1),
  ender_chest: getPosition(-1, 2),

  elytra: getPosition(-2, 0),
} as const;

export const chestPositions = {
  pvp: getPosition(0, 0),
  tools: getPosition(0, 1),
  trees: getPosition(0, 2),
  // ...
} as const;

export const opKitChestPositions = CU.getOPKitChestPositions(chestPositions, itemChestPositions);

export const defaultTaskInfo = CU.defineDefaultTask(chestPositions, {
  names: ['pvp'],
}); // can be false to not give a default kit

export const taskInfos = CU.defineTaskInfos(chestPositions, [
  {
    names: ['help', 'list'],
    task: new TaskGetWritableBook(),

    hideFromHelp: true,
  },
  {
    // if no task is defined, it will grab a kit
    // from the first name's chest (pvp)
    names: ['pvp', 'fight']
  },
  {
    // however, you can define a custom task,
    // for example, this will grab multiple kits
    names: ['test'],
    task: new TaskList([
      new TaskGrabItemsFromChestAndClose(chestPositions.tools),
      new TaskGrabItemsFromChestAndClose(chestPositions.trees),
    ], { delay: 50 }),
  },

  {
    names: ['random', 'surprise'],
    task: new TaskRandom(
      Object.values(chestPositions)
        .map(chestPosition => new TaskGrabItemsFromChestAndClose(chestPosition))
    ),
  },

  ...CU.getAllKitTasks(chestPositions),
]);
