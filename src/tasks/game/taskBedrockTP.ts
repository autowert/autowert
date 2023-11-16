import { Task } from '../task';
import type { Bot } from 'mineflayer';

export class TaskBedrockTP extends Task {
  execute(bot: Bot) {
    return new Promise<void>((resolve, reject) => {
      const listener = () => {
        cleanup();

        resolve();
      };

      bot.once('death', listener);
      bot.once('incomingTPdone', listener);

      const timeoutId = setTimeout(() => {
        cleanup();

        reject(new Error('timed out waiting for incoming tp'));
      }, 10000);

      const cleanup = () => {
        bot.off('death', listener);
        bot.off('incomingTPdone', listener);
        clearTimeout(timeoutId);
      };
    });
  }
}
