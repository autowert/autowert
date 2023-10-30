import { Task } from '../task';

import type { Bot } from 'mineflayer';

import { sleep } from '../../util/sleep';

export class TaskSuicide extends Task {
  execute(bot: Bot) {
    return new Promise<void>((resolve) => {
      let died = false;
      const suicideFailedListener = async () => {
        console.log('suicide failed');


        await sleep(2000);
        if (died) return;

        console.log('retrying /kill');
        bot.chat('/kill');
      };
      bot.on('suicideFailed', suicideFailedListener);

      bot.once('death', () => {
        console.log('bot died');

        bot.off('suicideFailed', suicideFailedListener);

        resolve();
      })

      console.log('attempting to run /kill');
      bot.chat('/kill');
    });
  }
}
