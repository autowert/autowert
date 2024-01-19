import type { Task } from './src/tasks/task';

import { Vec3 } from 'vec3';
import { TaskGrabItemsFromChestAndClose } from './src/tasks/chest/taskGrabItemsFromChestAndClose';
import { TaskList } from './src/tasks/taskList';
import { TaskGetWritableBook } from './src/tasks/items/taskGetWritableBook';
import { TaskRandom } from './src/tasks/taskRandom';

export const discordInvite = 'https://discord.gg/dVJFqbjc66';

export const notificationOptions: NotificationOptions = {
  enabled: true,
  instance: 'https://ntfy.sh/',
  topic: 'example-bot-topic',
};

// credentials for the dashboard, only to be used as the last resort
export const dashCredentials = {
  username: 'user',
  password: '1234',
};

// shulker, chest or double chest with feathers, ink sacks and books
export const bookMaterialsChestPosition = new Vec3(0, 0, 0);

const baseChest = { x: 0, y: 0, z: 0 };
function getPosition(row: number, col: number) {
  const x = baseChest.x;
  const y = baseChest.y + col;
  const z = baseChest.z - row;

  return new Vec3(x, y, z);
}

// chests containing only the item
export const itemChestPositions = {
  obsidian: getPosition(-1, 0),
  flint_and_steel: getPosition(-1, 1),
  ender_chest: getPosition(-1, 2),
};

export const chestPositions = {
  pvp: getPosition(0, 0),
  tools: getPosition(0, 1),
  trees: getPosition(0, 2),
  // ...
} as const;

export const opKitChestPositions: Record<string, Vec3 | undefined> = {
  ...chestPositions,
};

const getColorPosition = (row: number, col: number): [number, number] => [row, col];
const colorPositions = {
  black: getColorPosition(0, 0),
  pink: getColorPosition(0, 1),
  magenta: getColorPosition(0, 2),
  // ...
};
const colorEmpty1 = getColorPosition(4, 2);
const colorEmpty2 = getColorPosition(5, 2);

const concreteOffset = [0, 0, 0];
const concretePositions = {
  ...colorPositions,
};

const terracottaOffset = [0, 0, 0];
const terracottaPositions = {
  ...colorPositions,
  plain: colorEmpty1,
};

function getColorTaskDefinitions(name: string, colorOffset: number[], colorPositions: Record<string, [number, number]>): TaskDefinition[] {
  const colorTaskDefinitions: TaskDefinition[] = [];

  for (const [color, pos] of Object.entries(colorPositions)) {
    const chestPosition = getPosition(pos[0], pos[1])
      .offset(colorOffset[0], colorOffset[1], colorOffset[2]);

    const names = [`${color}-${name}`, `${color}_${name}`];
    const task = new TaskGrabItemsFromChestAndClose(chestPosition);

    opKitChestPositions[names[0]] = chestPosition;

    colorTaskDefinitions.push({
      names,
      task,

      hideFromHelp: true,
    });
  }

  return colorTaskDefinitions;
}

const defaultTaskDefinition: TaskDefinition | false = {
  names: ['pvp'],
}; // can be false to not give a default kit

const taskDefinitions: TaskDefinition[] = [
  {
    names: ['help', 'list'],
    task: new TaskGetWritableBook(),
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

  ...getColorTaskDefinitions('concrete', concreteOffset, concretePositions),
  ...getColorTaskDefinitions('terracotta', terracottaOffset, terracottaPositions),

  {
    names: ['random', 'surprise'],
    task: new TaskRandom(
      Object.values(chestPositions)
        .map(chestPosition => new TaskGrabItemsFromChestAndClose(chestPosition))
    ),
  },
];

export const defaultTaskInfo: TaskInfo | false = defaultTaskDefinition ? addDefaultTask(defaultTaskDefinition) : false;
export const taskInfos: TaskInfo[] = taskDefinitions.map(taskDefinition => addDefaultTask(taskDefinition));

function addDefaultTask(taskDefinition: TaskDefinition): TaskInfo {
  let task: Task;

  if ('task' in taskDefinition) {
    task = taskDefinition.task;
  } else {
    const chestName = taskDefinition.names[0];
    const chestPosition = chestPositions[chestName];
    task = new TaskGrabItemsFromChestAndClose(chestPosition);
  }

  const taskInfo: TaskInfo = {
    ...taskDefinition,
    task,
  };

  return taskInfo;
}

type TaskDefinition = {
  // if the task only has names,
  // the first name is used to set up the default task
  names: [keyof typeof chestPositions, ...string[]],

  hideFromHelp?: boolean,
} | TaskInfo;

export type TaskInfo = {
  names: string[],
  task: Task,

  hideFromHelp?: boolean,
};

export type NotificationOptions = {
  enabled: false;
} | {
  enabled: true;
  instance?: string; // https://ntfy.sh/
  topic: string;
}
