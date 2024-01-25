import type { Plugin as BotPlugin } from 'mineflayer';

export const tpyPlugin: BotPlugin = (bot) => {
  bot.on('incomingTPrequest', async (from) => {
    // TODO: USE UUIDS (VERY IMPORTANT)

    if (from === 'Manue__l') bot.chat('/tpy Manue__l');
    /* else if (from === 'GoogleComStuff') {
      if (!bot.players['Manue__l']) {
        console.log(from, 'wants to tp, but Manue__l is offline');

        bot.chat('/w GoogleComStuff You may not teleport while Manue__l is offline.');
        return;
      }

      bot.chat('/w Manue__l GoogleComStuff would like to teleport to autowert.');

      let resolveSent: () => void;
      let sentPromise = new Promise<void>((resolve) => { resolveSent = resolve; });
      let chatDisabled = false;

      const onMessageListener: mineflayer.BotEvents['messagestr'] = (message) => {
        if (/^To (Manue__l): /i.test(message)) resolveSent();
        if (/^(Manue__l)'s chat is disabled\.$/i.test(message)) chatDisabled = true;
      };
      bot.on('messagestr', onMessageListener);

      await sentPromise;
      await sleep(50);

      console.log(from, 'wants to tp', 'Manue__l is ' + (chatDisabled ? 'afk' : 'not afk'));
      bot.off('messagestr', onMessageListener);

      if (chatDisabled) {
        // Manue__l is afk
        bot.chat('/w GoogleComStuff You may not teleport while Manue__l is afk.');
        return;
      }

      bot.chat('/tpy GoogleComStuff');
    } */
    else if (from === 'GoogleComStuff') bot.chat('/tpy GoogleComStuff');
  });
};
