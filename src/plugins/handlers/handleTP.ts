import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';

import { sleep } from '../../util/sleep';
import { TaskWriteHelpBook } from '../../tasks/items/taskWriteHelpBook';
import { TaskDropAllItems } from '../../tasks/game/taskDropAllItems';

export const handleTPPlugin: BotPlugin = (bot) => {
  bot.on('outgoingTPdone', async (to) => {
    await sleep(50);

    let died = false;
    const deathListener: BotEvents['death'] = () => { died = true; };
    bot.once('death', deathListener);

    try {
      if (bot.TPYTask.has(to)) {
        console.log(`executing TPY task for ${to}`);

        await bot.TPYTask.execute(to);
      } else if (bot.hasWritableBookInInventory()) {
        console.log('no TPY task, but bot has writable book, so writing a help book anyway');

        await new TaskWriteHelpBook(to).execute(bot);
      }
    } catch (err) {
      console.warn('failed to execute TPY task', err);
    }

    await new TaskDropAllItems().execute(bot);

    bot.off('death', deathListener);
    if (!died) bot.chat('/kill');
  });
};
