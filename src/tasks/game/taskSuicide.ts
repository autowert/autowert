import { Task } from '../task';

import type { Bot } from 'mineflayer';

import { sleep } from '../../util/sleep';

export class TaskSuicide extends Task {
  execute(bot: Bot) {
    return new Promise<void>((resolve) => {
      let died = false;
      const suicideFailedListener = async () => {
        await sleep(1000);

        if (died) return;
        bot.chat('/kill');
      };
      bot.on('suicideFailed', suicideFailedListener);

      bot.once('death', () => {
        bot.off('suicideFailed', suicideFailedListener);

        resolve();
      })

      bot.chat('/kill');
    });
  }
}
