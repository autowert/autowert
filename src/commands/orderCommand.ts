import { TaskGrabItemsFromChestAndClose } from '../tasks/chest/taskGrabItemsFromChestAndClose';
import { TaskList } from '../tasks/taskList';
import { TPCommand } from './TPCommand';

import type { Vec3 } from 'vec3';

const MAX_PER_KIT = 4;
const MAX_PER_ORDER = 6;

export const orderCommand = new TPCommand({
  name: 'order',
  description: 'Order multiple kits at once.',
  usage: '<...kit[*<amount>]>',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: async ({ bot, invokerUsername, args }) => {
    let failReason: string | null = null;
    if (args.length === 0)
      failReason = 'args is required';

    const orderEntries: Map<string, OrderEntry> = new Map();
    for (const arg of args) {
      const parts = arg.split('*');

      const name = parts[0].toLowerCase();
      const amount = parts[1] ? parseInt(parts[1]) : 1;

      if (parts.length > 2 || !name || Number.isNaN(amount)) {
        failReason = 'invalid syntax';
        break;
      }

      if (!bot.kitStore.nameTaskIndexMap.has(name)) {
        failReason = 'unknown kit';
        break;
      }

      const taskIndex = bot.kitStore.nameTaskIndexMap.get(name)!;
      const taskInfo = bot.kitStore.taskInfos[taskIndex];
      const taskName = taskInfo.names[0];

      if (taskInfo.isOutOfStock) {
        failReason = `kit ${taskName} out of stock`;
        break;
      }

      if (taskInfo.task instanceof TaskGrabItemsFromChestAndClose === false) {
        failReason = `unsupported kit ${taskName}`;
        break;
      }
      const task = taskInfo.task as TaskGrabItemsFromChestAndClose;

      if (orderEntries.has(taskName)) {
        orderEntries.get(taskName)!.amount += amount;
      } else {
        const chestPosition = task.chestPosition;

        orderEntries.set(taskName, {
          name: taskName,
          amount,
          chestPosition,
        });
      }
    }

    let total = 0;
    for (const orderEntry of orderEntries.values()) {
      if (failReason) break;

      const { amount } = orderEntry;
      total += amount;

      if (amount <= 0) {
        failReason = 'request at least one per kit';
      } else if (amount > MAX_PER_KIT) {
        failReason = `only request up to ${MAX_PER_KIT} per kit`;
      } else if (total > MAX_PER_ORDER) {
        failReason = `only request ${MAX_PER_ORDER} per order`;
      } else {
        continue;
      }

      break;
    }

    if (failReason) {
      console.log(`Order for ${invokerUsername} failed: ${failReason}`);
      return {
        success: false,
        // chatResponse: failReason, // TODO: private response
      }
    }

    // 1d tavelling salesman problem: linear sorting algorithm to minimize walking distance
    const xCoords: number[] = [];
    const zCoords: number[] = [];
    for (const orderEntry of orderEntries.values()) {
      const { chestPosition } = orderEntry;
      xCoords.push(chestPosition.x);
      zCoords.push(chestPosition.z);
    };

    const dx = Math.abs(Math.max(...xCoords) - Math.min(...xCoords));
    const dz = Math.abs(Math.max(...zCoords) - Math.min(...zCoords))
    const sortBy = dx > dz ? 'x' : 'z';

    const sorted = Array.from(orderEntries.values()).sort((a, b) => {
      return a.chestPosition[sortBy] - b.chestPosition[sortBy];
    });
    // TODO: reverse if bot is closer to last than first (maybe?)

    console.log(`Order for ${invokerUsername}: ${sorted.map((orderEntry) => `${orderEntry.name}*${orderEntry.amount}`).join(',')}`);

    return {
      beforeTPTask: new TaskList(
        sorted.map((orderEntry) => new TaskGrabItemsFromChestAndClose(orderEntry.chestPosition, orderEntry.amount)),
        { delay: 50 },
      ),
    };
  },
});

type OrderEntry = {
  name: string;
  amount: number;
  chestPosition: Vec3;
};
