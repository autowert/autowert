import type { Plugin as BotPlugin } from 'mineflayer';

import { sleep } from '../../util/sleep';

export const handleSuicideFailedPlugin: BotPlugin = (bot) => {
  bot.on('suicideFailed', async () => {
    console.log('suicide failed, retrying...');

    let died = false;
    bot.once('death', () => { died = true; });

    await sleep(3000);
    if (died) return;
    bot.chat('/kill');

    await sleep(3000);
    if (died) return;
    bot.chat('/kill');
  });
};
