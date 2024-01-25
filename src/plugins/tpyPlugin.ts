import type { Plugin as BotPlugin } from 'mineflayer';

export const tpyPlugin: BotPlugin = (bot) => {
  bot.on('incomingTPrequest', async (from) => {
    // TODO: USE UUIDS (VERY IMPORTANT)
    if (from !== 'Manue__l' && from !== 'GoogleComStuff') return;

    if (from in bot.players === false) {
      console.warn('incoming tp request from not connected player', from);

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
        console.warn('WARNING: players starting with same name:', playersWithSameName);
      }

      return;
    }

    if (from === 'Manue__l') bot.chat('/tpy Manue__l');
    else if (from === 'GoogleComStuff') bot.chat('/tpy GoogleComStuff');
  });
};
