import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';

import { logger } from '../util/logger';

const queuePosRe = /^Position in queue\: ([0-9]+)$/;
const queueDoneRe = /^Connecting to (?:0b0t|the server)\.\.\.$/;

// You were sent back to the queue for: The server you were previously on went down, you have been connected to a fallback server
const fallbackToQueueRe = /^You were sent back to the queue for:\s*(.*)$/;

export const queueHandlerPlugin: BotPlugin = (bot) => {
  let isQueue = false, mainServerEmitted = false;;

  const onQueueMessageStr: BotEvents['messagestr'] = (message) => {
    const queuePosMatch = queuePosRe.exec(message);
    const queueDoneMatch = queueDoneRe.exec(message);


    if (queuePosMatch && queuePosMatch[1]) {
      isQueue = true;
      bot.emit('queuePosition', Number(queuePosMatch[1]));
    }

    if (isQueue && queueDoneMatch) {
      bot.off('messagestr', onQueueMessageStr);

      bot.emit('queueDone');
      bot.once('spawn', () => {
        bot.emit('mainServer');
      });
    }
  };

  const onMainServerMessageStr: BotEvents['messagestr'] = (message) => {
    const fallbacktoQueueMatch = fallbackToQueueRe.exec(message);
    if (fallbacktoQueueMatch) {
      bot.off('messagestr', onMainServerMessageStr);
      bot.on('messagestr', onQueueMessageStr);

      isQueue = true;
      bot.emit('mainServerLeft', fallbacktoQueueMatch[1]);
    }
  };

  bot.on('messagestr', onQueueMessageStr);
  bot.on('mainServer', () => {
    mainServerEmitted = true;

    bot.off('messagestr', onQueueMessageStr);
    bot.on('messagestr', onMainServerMessageStr);
  });

  // if the bot spawns in queue, it takes a short while, then it receives the first queue position messages
  // otherwise, it spawns on the server immediately, which the below code should detect, and the immediately emit mainServer
  bot._client.once('position', (packet) => {
    let { x, z }: { x: number, z: number } = ('x' in packet) ? packet : bot.entity.position;

    // we only care whether the coords are exactly zero or not, so we only log the modulo
    logger.debug({ x: x % 1024, z: z % 1024 }, 'Received first position packet');

    if (x !== 0 || z !== 0) {
      logger.info('First position packet is non-zero, assuming bot not in queue and emitting mainServer');

      bot.emit('noQueue');
      bot.once('spawn', () => {
        bot.emit('mainServer');
      });
    }
  });

  // fallback logic, if mainServer detection fails
  bot.once('spawn', () => {
    bot.once('death', () => {
      bot.once('spawn', () => {
        if (mainServerEmitted) return;
        logger.warn('WARNING: bot respawned but mainServer event was not emitted yet, code change is required');
        bot.emit('mainServer');
      })
    });
  });
};

declare module 'mineflayer' {
  interface BotEvents {
    'queuePosition': (position: number) => Promise<void> | void;
    'queueDone': () => Promise<void> | void;
    'noQueue': () => Promise<void> | void;
    'mainServer': () => Promise<void> | void;

    'mainServerLeft': (reason?: string) => Promise<void> | void;
  }
}
