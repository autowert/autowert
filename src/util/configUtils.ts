import { Vec3 } from 'vec3';
import { TaskList } from '../tasks/taskList';

import type { Prefix } from '../commands/BaseCommand';
import type { Task } from '../tasks/task';
import { TaskGrabItemsFromChestAndClose } from '../tasks/chest/taskGrabItemsFromChestAndClose';

export const definePrefix = (prefix: Prefix) => prefix;
export const defineDiscordInvite = (inviteLink: string | false) => inviteLink;

export const defineNotifications = (options: NotificationOptions) => options;

export const defineDashboard = (options: DashboardOptions) => options;

export const defineDefaultTask = <T extends ChestPositions>(chestPositions: T, defaultTaskDefinition: TaskDefinition<T> | false): TaskInfo | false => {
  if (!defaultTaskDefinition) return false;
  return addDefaultTask(chestPositions, defaultTaskDefinition);
};

export const defineTaskInfos = <T extends ChestPositions>(chestPositions: T, taskDefinitions: TaskDefinition<T>[]) => {
  return taskDefinitions.map((taskDefinition) => addDefaultTask(chestPositions, taskDefinition));
}

export function getPositionFacotry(baseChest: Vec3, perRowOffset: [number, number, number] | Vec3) {
  if (Array.isArray(perRowOffset)) {
    perRowOffset = new Vec3(...perRowOffset);
  }

  return function getPosition(row: number, col: number) {
    // careful not to use .add or .scale that modify the instance
    return baseChest.plus(perRowOffset.scaled(row)).offset(0, col, 0);
  }
};

export function getOPKitChestPositions(chestPositions: ChestPositions, itemChestPositions?: ChestPositions) {
  const opKitChestPositions = { ...chestPositions };
  if (itemChestPositions) {
    for (const [item, position] of Object.entries(itemChestPositions)) {
      opKitChestPositions['item:' + item] = position;
    }
  }

  return opKitChestPositions;
}

export function getAllKitTasks(chestPositions: ChestPositions) {
  const allKitsTasks: TaskInfo[] = [];
  const allKitNames = Object.keys(chestPositions);

  while (allKitNames.length) {
    const names = allKitNames.splice(0, 27);
    allKitsTasks.push({
      names: ['allkits-' + (allKitsTasks.length + 1)],
      task: new TaskList(
        names.map((name) => new TaskGrabItemsFromChestAndClose(chestPositions[name])),
        { delay: 50 },
      ),
      adminOnly: true,
    });
  }

  return allKitsTasks;
}

function addDefaultTask<T extends ChestPositions>(chestPositions: T, taskDefinition: TaskDefinition<T>): TaskInfo {
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
    names: taskDefinition.names as string[],
  };

  return taskInfo;
}

type NotificationOptions = {
  enabled: false;
} | {
  enabled: true;
  instance?: string; // https://ntfy.sh/
  topic: string;
}

type DashboardOptions = {
  enabled: false;
} | {
  enabled: true;
  bind?: string;
  port?: number;
  username: string;
  password: string;
};

type ChestPositions = Record<string, Vec3>;

type TaskDefinition<T extends ChestPositions> = {
  // if the task only has names,
  // the first name is used to set up the default task
  names: [keyof T, ...string[]],

  hideFromHelp?: boolean,
  adminOnly?: boolean,
} | TaskInfo;

export type TaskInfo = {
  names: string[],
  task: Task,

  hideFromHelp?: boolean,
  adminOnly?: boolean,
};
