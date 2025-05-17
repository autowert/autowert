import type { Plugin as BotPlugin } from 'mineflayer';

export const handleDeathPlugin: BotPlugin = (bot) => {
  bot.on('death', () => {
    bot.clearControlStates();
  });
};
