import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';

const queuePosRe = /^Position in queue\: ([0-9]+)$/;
// const queueDoneRe = /^Connecting to the server\.\.\.$/;
const queueDoneRe = /^Connecting to 0b0t\.\.\.$/;

// You were sent back to the queue for: The server you were previously on went down, you have been connected to a fallback server
const fallbackToQueueRe = /^You were sent back to the queue for:\s*(.*)$/;

export const queueHandlerPlugin: BotPlugin = (bot) => {
  let isQueue = false;

  const onMessageStr: BotEvents['messagestr'] = (message) => {
    // hack on 0b0t to detect main server
    if (!isQueue && message === ' '.repeat(37)) {
      bot.off('messagestr', onMessageStr);

      bot.emit('noQueue');
      bot.once('spawn', () => {
        bot.emit('mainServer');
      });
      return;
    }

    const queuePosMatch = queuePosRe.exec(message);
    const queueDoneMatch = queueDoneRe.exec(message);

    if (queuePosMatch && queuePosMatch[1]) {
      isQueue = true;
      bot.emit('queuePosition', Number(queuePosMatch[1]));
    }

    if (isQueue && queueDoneMatch) {
      bot.off('messagestr', onMessageStr);

      bot.emit('queueDone');
      bot.once('spawn', () => {
        bot.emit('mainServer');
      });
    }
  };

  bot.on('messagestr', onMessageStr);

  const onMainServerMessageStr: BotEvents['messagestr'] = (message) => {
    const fallbacktoQueueMatch = fallbackToQueueRe.exec(message);
    if (fallbacktoQueueMatch) {
      bot.off('messagestr', onMainServerMessageStr);

      isQueue = true;
      bot.on('messagestr', onMessageStr);

      bot.emit('mainServerLeft', fallbacktoQueueMatch[1]);
    }
  };
  bot.on('mainServer', () => {
    bot.on('messagestr', onMainServerMessageStr);
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
