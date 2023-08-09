import type { Plugin as BotPlugin, Bot } from 'mineflayer';
import { chests } from '../../../config';
import { Vec3 } from 'vec3';
import { sleep } from '../../util/sleep';
import './kitStore';

export const giveKitPlugin: BotPlugin = (bot) => {
  if (!bot.kitStore) bot.kitStore = {} as any;

  bot.kitStore.chests = chests;
  const defaultChestInfo = bot.kitStore.chests.find((chest) => chest.default)!;
  if (!defaultChestInfo) {
    throw new Error('no default chest defined');
  }
  bot.kitStore.defaultChest = defaultChestInfo;

  bot.kitStore.pendingRequests = new Set();
  bot.on('outgoingTPrequest', (to) => { bot.kitStore.pendingRequests.add(to); });
  bot.on('outgoingTPaccepted', (to) => { bot.kitStore.pendingRequests.delete(to); });
  bot.on('outgoingTPaccepted', (to) => { bot.kitStore.pendingRequests.delete(to); });
  bot.on('outgoingTPdenied', async (to) => {
    await sleep(30 * 1000);
    bot.kitStore.pendingRequests.delete(to);
  });

  bot.kitStore.totalRequests = new Map();

  bot.kitStore.giveKit = async (username, kitName) => {
    kitName = kitName?.toLowerCase();

    if (bot.kitStore.pendingRequests.has(username)) {
      console.log(`pending request to ${username}, not giving a kit. (wanted a ${kitName} kit)`);

      // console.log('still giving a kit to debug the fucking bug');
      return;
    }

    const userTotalRequests = bot.kitStore.totalRequests.get(username) || 0;
    if(userTotalRequests > 40) {
      console.log(`total kit requests from ${username} this session exceed the maximum of 40 (wanted a ${kitName} kit)`);

      return;
    }
    bot.kitStore.totalRequests.set(username, userTotalRequests + 1);

    const chestInfo =
      (kitName && bot.kitStore.chests.find((chest) => chest.names.includes(kitName!))) ||
      bot.kitStore.defaultChest;

    if (kitName && chestInfo === bot.kitStore.defaultChest && !bot.kitStore.defaultChest.names.includes(kitName)) {
      console.log('unknown kit:', kitName, '-', 'not giving a kit.');
      return;
    }

    console.log(`giving a ${chestInfo.names.at(0) || 'NO NAME WTF?'} (${kitName}) kit to ${username}.`)
    try {
      await bot.kitStore.grabKit(chestInfo);
      bot.chat(`/tpa ${username}`);
    } catch (err) {
      console.log('failed to get kit');
      console.log(err);

      bot.chat('/kill');
    }
  };
};
