import type { Plugin as BotPlugin } from 'mineflayer';

import { sleep } from '../../util/sleep';
import { ItemOutOfStockError } from '../../tasks/chest/taskGrabItemsFromChest';

import './kitStore';

import { taskInfos, defaultTaskInfo } from '../../../config';

export const giveKitPlugin: BotPlugin = (bot) => {
  if (!bot.kitStore) bot.kitStore = {} as any;

  bot.kitStore.taskInfos = taskInfos;
  bot.kitStore.defaultTaskInfo = defaultTaskInfo;

  bot.kitStore.pendingRequests = new Set<string>();
  bot.on('outgoingTPrequest', (to) => { bot.kitStore.pendingRequests.add(to); });
  bot.on('outgoingTPaccepted', (to) => { bot.kitStore.pendingRequests.delete(to); });

  bot.on('outgoingTPtimeout', (to) => { bot.kitStore.pendingRequests.delete(to); });
  bot.on('outgoingTPdenied', async (to) => {
    await sleep(30 * 1000);
    bot.kitStore.pendingRequests.delete(to);
  });

  bot.kitStore.totalRequests = new Map<string, number>();

  bot.kitStore.giveKit = async (username, kitName) => {
    kitName = kitName?.toLowerCase();

    if (bot.kitStore.pendingRequests.has(username)) {
      console.log(`pending request to ${username}, not giving a kit. (wanted a ${kitName} kit)`);
      return;
    }

    const userTotalRequests = bot.kitStore.totalRequests.get(username) || 0;
    if (userTotalRequests > 40) {
      console.log(`total kit requests from ${username} this session exceed the maximum of 40 (wanted a ${kitName} kit)`);

      return;
    }

    let taskInfo: (typeof bot)['kitStore']['taskInfos'][number];
    if (kitName) {
      const _taskInfo = bot.kitStore.taskInfos.find(
        (taskInfo) => {
          return taskInfo.names.includes(kitName || '')
        }
      );

      if (!_taskInfo) {
        console.log('unknown kit:', kitName, '-', 'not giving a kit.');
        return;
      }
      taskInfo = _taskInfo;
    } else {
      const _taskInfo = bot.kitStore.defaultTaskInfo;
      if (!_taskInfo) return; // no default task
      taskInfo = _taskInfo;
    }

    console.log(`executing task ${taskInfo.names.at(0) || 'NO NAME WTF?'} (${kitName}) kit to ${username}.`)
    if (taskInfo.isOutOfStock) {
      console.warn('item is out of stock, not giving a kit');
      return;
    }

    bot.kitStore.totalRequests.set(username, userTotalRequests + 1);

    const task = taskInfo.task;
    try {
      await task.execute(bot);
      bot.chat(`/tpa ${username}`);
    } catch (err) {
      console.log('failed to execute task', task.getName());
      console.log(err);

      if (err instanceof ItemOutOfStockError) {
        console.error('kit', taskInfo.names[0], 'is out of stock, disableing');
        taskInfo.isOutOfStock = true;
      }

      bot.chat('/kill');
    }
  };
};
