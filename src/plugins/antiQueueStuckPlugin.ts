import type { Plugin as BotPlugin } from 'mineflayer';

import { sleep } from '../util/sleep';
import { logger } from '../util/logger';

export const antiQueueStuckPlugin: BotPlugin = (bot) => {
  bot.on('queueDone', async () => {
    await sleep(10_000);

    const position = bot.entity.position.rounded();
    if (position.x === 0 && position.z === 0) {
      logger.warn({ position }, 'Queue is done, but bot not connected to main server within 10s.');
      logger.warn('Attempting to reconnect, dispatching end event.');
      bot.end('intentionalAntiQueueStuckDisconnect');
    }
  });
};
