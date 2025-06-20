import type { Plugin as BotPlugin } from 'mineflayer';

import { sleep } from '../../util/sleep';
import { logger, omit } from '../../util/logger';
import { ItemOutOfStockError } from '../../tasks/chest/taskGrabItemsFromChest';

import './kitStore';

import { taskInfos, defaultTaskInfo } from '../../../config';

export const giveKitPlugin: BotPlugin = (bot) => {
  // TODO: move this to kitCommand

  if (!bot.kitStore) bot.kitStore = {} as any;

  bot.kitStore.taskInfos = taskInfos;
  bot.kitStore.defaultTaskInfo = defaultTaskInfo;

  bot.kitStore.nameTaskIndexMap = new Map();
  for (const [index, taskInfo] of bot.kitStore.taskInfos.entries()) {
    for (const name of taskInfo.names) {
      const nameLower = name.toLowerCase();

      if (bot.kitStore.nameTaskIndexMap.has(nameLower)) {
        logger.warn(
          { name: nameLower, suggestion: 'Modify the config to resolve this!' },
          'Duplicate name in taskInfos, overwriting.',
        );
      }

      bot.kitStore.nameTaskIndexMap.set(nameLower, index);
    }
  }

  // TODO: use nameTaskIndexMap below

  bot.kitStore.pendingRequests = new Set<string>();
  bot.on('outgoingTPrequest', (to) => { bot.kitStore.pendingRequests.add(to); });
  bot.on('outgoingTPaccepted', (to) => { bot.kitStore.pendingRequests.delete(to); });

  bot.on('outgoingTPtimeout', (to) => { bot.kitStore.pendingRequests.delete(to); });
  bot.on('outgoingTPdenied', async (to) => {
    await sleep(30 * 1000);
    bot.kitStore.pendingRequests.delete(to);
  });

  // TODO: clear totalRequests after maybe 24h
  bot.kitStore.totalRequests = new Map<string, number>();

  bot.kitStore.getKit = async (username, kitName) => {
    kitName = kitName?.toLowerCase();

    if (bot.kitStore.pendingRequests.has(username)) {
      logger.info({ username, kitName }, 'TP Request pending, not giving another kit.');
      return { success: false };
    }

    const userTotalRequests = bot.kitStore.totalRequests.get(username) ?? 0;
    if (userTotalRequests > 40) {
      logger.info({ username, userTotalRequests, kitName }, 'User exceeded the maximum number of kit requests, not giving another kit.');
      return { success: false };
    }

    let taskInfo: (typeof bot)['kitStore']['taskInfos'][number];
    if (kitName) {
      const _taskInfo = bot.kitStore.taskInfos.find(
        (taskInfo) => {
          return taskInfo.names.includes(kitName || '');
        }
      );

      if (!_taskInfo) {
        logger.debug({ username, kitName }, 'Unknown kit requested, ignoring');
        return { success: false };
      }
      taskInfo = _taskInfo;
    } else {
      const _taskInfo = bot.kitStore.defaultTaskInfo;
      if (!_taskInfo) return { success: false }; // no default task
      taskInfo = _taskInfo;
    }

    if (taskInfo.adminOnly && username !== 'Manue__l') {
      logger.info(
        { username, kitName, taskInfo: omit(taskInfo, 'task') },
        'User without permission requested admin only kit.',
      );
      return { success: false };
    }

    logger.info(
      { username, kitName, taskInfo: omit(taskInfo, 'task') },
      'Executing task to obtain kit to give',
    );

    if (taskInfo.isOutOfStock) {
      // TODO: keep track of successful delivery, if first time empty dispatch notification
      logger.info({ username, kitName }, 'Kit is out of stock, not giving');
      return { success: false };
    }

    bot.kitStore.totalRequests.set(username, userTotalRequests + 1);

    const task = taskInfo.task;
    try {
      await task.execute(bot)
      return { success: true };
    } catch (err) {
      if (err instanceof ItemOutOfStockError) {
        logger.info({ taskInfo: omit(taskInfo, 'task') }, 'Kit task threw ItemOutOfStockError, disabling');
        taskInfo.isOutOfStock = true;
      } else {
        logger.error({ taskName: task.getName(), err }, 'Failed to execute task');
      }

      bot.chat('/kill');
      return { success: false };
    }
  };
};
