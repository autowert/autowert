import type { Plugin as BotPlugin } from 'mineflayer';
import { sleep } from '../util/sleep';

export const antiQueueStuckPlugin: BotPlugin = (bot) => {
  bot.on('queueDone', async () => {
    await sleep(10_000);

    if (bot.entity.position.x === 0 && bot.entity.position.z === 0) {
      console.warn('Queue is done, but bot not connected to main server within 10000ms.');
      console.warn('Attempting to reconnect.');
      bot.end('intentionalAntiQueueStuckDisconnect');
    }
  });
};
