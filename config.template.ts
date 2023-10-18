import type { Task } from './src/tasks/task';

import { Vec3 } from 'vec3';
import { TaskGrabItemsFromChestAndClose } from './src/tasks/chest/taskGrabItemsFromChestAndClose';
import { TaskList } from './src/tasks/taskList';

// shulker, chest or double chest with feathers, ink sacks and books
export const bookMaterialsChestPosition = new Vec3(0, 0, 0);

const baseChest = { x: 0, y: 0, z: 0 };
function getPosition(row: number, col: number) {
  const x = baseChest.x;
  const y = baseChest.y + col;
  const z = baseChest.z - row;

  return new Vec3(x, y, z);
}

const chestPositions = {
  pvp: getPosition(0, 0),
  tools: getPosition(0, 1),
  trees: getPosition(0, 2),
  // ...
} as const;

const defaultTaskDefinition: TaskDefinition | false = {
  names: ['pvp'],
}; // can be false to not give a default kit

const taskDefinitions: TaskDefinition[] = [
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
} | TaskInfo;

export type TaskInfo = {
  names: string[],
  task: Task,
};
