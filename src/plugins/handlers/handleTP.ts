import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';

import { sleep } from '../../util/sleep';
import { logger } from '../../util/logger';

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
        const taskName = bot.TPYTask.get(to)!.getName();
        logger.info({ to, taskName }, 'Executing TPY task');

        await bot.TPYTask.execute(to);
      } else if (bot.hasWritableBookInInventory()) {
        logger.info({}, 'Found a book and no TPY Task for user, writing help book');

        await new TaskWriteHelpBook(to).execute(bot);
      }
    } catch (err) {
      logger.error({ to, err }, 'Error executing TPY task');
    }

    await new TaskDropAllItems().execute(bot);

    bot.off('death', deathListener);
    if (!died) bot.chat('/kill');
  });
};
