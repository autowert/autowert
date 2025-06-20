import type { Plugin as BotPlugin } from 'mineflayer';

import { logger } from '../util/logger';

export const tpyPlugin: BotPlugin = (bot) => {
  bot.on('incomingTPrequest', async (from) => {
    // TODO: USE UUIDS (VERY IMPORTANT)
    if (from !== 'Manue__l') return;

    if (from in bot.players === false) {
      logger.warn({ from }, 'Incoming tp request from Player that is not online');

      const fromLowerCase = from.toLowerCase();
      const playersWithSameName: string[] = [];
      for (const player of Object.values(bot.players)) {
        const { username } = player;
        const usernameLowerCase = username.toLowerCase();

        if (usernameLowerCase.startsWith(fromLowerCase)) {
          playersWithSameName.push(username);
        }
      }

      if (playersWithSameName.length) {
        logger.warn({ playersWithSameName }, 'WARNING: players starting with same name');
      }

      return;
    }

    if (from === 'Manue__l') bot.chat('/tpy Manue__l');
  });
};
