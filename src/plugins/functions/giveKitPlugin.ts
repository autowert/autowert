import type { Plugin as BotPlugin, Bot } from 'mineflayer';
import { Chest as chestInfo, chests } from '../../../config';
import { Vec3 } from 'vec3';
import { sleep } from '../../util/sleep';

export const giveKitPlugin: BotPlugin = (bot) => {
  const defaultChestInfo = chests.find((chest) => chest.default)!;
  if (!defaultChestInfo) {
    throw new Error('no default chest defined');
  }

  const pending: Set<string> = new Set();
  bot.on('outgoingTPrequest', (to) => { pending.add(to); });
  bot.on('outgoingTPaccepted', (to) => { pending.delete(to); });
  bot.on('outgoingTPaccepted', (to) => { pending.delete(to); });
  bot.on('outgoingTPdenied', async (to) => {
    await sleep(30 * 1000);
    pending.delete(to);
  });

  bot.giveKit = async (username, kitName) => {
    kitName = kitName?.toLowerCase();

    if (pending.has(username)) {
      console.log(`pending request to ${username}, not giving a kit. (wanted a ${kitName} kit)`);

      // console.log('still giving a kit to debug the fucking bug');
      return;
    }

    const chestInfo =
      (kitName && chests.find((chest) => chest.names.includes(kitName!))) ||
      defaultChestInfo;

    if (kitName && chestInfo === defaultChestInfo && !defaultChestInfo.names.includes(kitName)) {
      console.log('unknown kit:', kitName, '-', 'not giving a kit.');
      return;
    }

    console.log(`giving a ${chestInfo.names.at(0) || 'NO NAME WTF?'} (${kitName}) kit to ${username}.`)
    try {
      await bot.grabKit(chestInfo);
      bot.chat(`/tpa ${username}`);
    } catch (err) {
      console.log('failed to get kit');
      console.log(err);

      bot.chat('/kill');
    }
  };
};

declare module 'mineflayer' {
  interface Bot {
    giveKit: (username: string, kitName?: string) => Promise<void>;
  }
}
