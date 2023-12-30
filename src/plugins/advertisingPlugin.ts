import type { Plugin as BotPlugin } from 'mineflayer';

import { random } from '../util/random';
import { sleep } from '../util/sleep';
import { discordInvite } from '../../config';

const MIN_DELAY = 20 * 60 * 1000; // 20 min
const MAX_DELAY = 60 * 60 * 1000; // 1 hour

const msgColorChar = ', ';
const blueChar = '`';

const ads = `
Join our Discord and suggest a kit: ${blueChar}${discordInvite}
Need my Discord? ${blueChar}${discordInvite}
Drop by my Discord server: ${blueChar}${discordInvite}
You can suggest new features on Discord: ${blueChar}${discordInvite}
You can find screenshots of all my kits on Discord: ${blueChar}${discordInvite}
Stay up-to-date on my Discord: ${blueChar}${discordInvite}
Source code is on my Discord: ${blueChar}${discordInvite}
 `.slice(1, -2)
  .replace(/^/gm, msgColorChar)
  .split('\n');
function getAd(): string {
  return ads[random(0, ads.length - 1)];
}

export const advertisingPlugin: BotPlugin = (bot) => {
  bot.once('canSpeak', async () => {
    let messages = 0;
    bot.on('chat', () => { messages++; });

    let nextAd = Date.now() + random(MIN_DELAY, MAX_DELAY);

    while (!bot._client.ended) {
      if (Date.now() <= nextAd) {
        // prevent ads when the server is inactive
        if (messages < 40) {
          nextAd += random(0, MIN_DELAY);
          continue;
        }

        bot.chat(getAd());
        nextAd = Date.now() + random(MIN_DELAY, MAX_DELAY);
        messages = 0;
      }

      await sleep(5000);
    }
  });
};
