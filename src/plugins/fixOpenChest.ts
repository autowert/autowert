import type { Plugin as BotPlugin } from 'mineflayer';
import { sleep } from '../util/sleep';

// it appears 0b0t enforces a minimum delay between opening chests
// after opening a chest, opening another chest only works after that delay
// sending the packet before does not open a chest and will result in a timeout error
const MIN_CHEST_DELAY = 2_010;

export const fisOpenChestPlugin: BotPlugin = (bot) => {
  const _openChest = bot.openChest;

  let lastOpen = 0;

  bot.openChest = async function openChest(...args: Parameters<typeof _openChest>) {
    const dt = Date.now() - lastOpen;
    if (dt < MIN_CHEST_DELAY) await sleep(MIN_CHEST_DELAY - dt);
    const chest = await _openChest.apply(this, args);
    lastOpen = Date.now();
    return chest;
  }
};
