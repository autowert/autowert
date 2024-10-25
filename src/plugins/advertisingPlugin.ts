import type { Plugin as BotPlugin } from 'mineflayer';

import { random } from '../util/random';
import { sleep } from '../util/sleep';
import { discordInvite } from '../../config';

const MIN_DELAY = 20 * 60 * 1000; // 20 min
const MAX_DELAY = 60 * 60 * 1000; // 1 hour

const dcColorChar = ', ';
const kitColorChar = ': ';
const blueChar = '`';

// advertise the discord server
const discordAds = `
Join our Discord and suggest a kit: ${blueChar}${discordInvite}
Need my Discord? ${blueChar}${discordInvite}
Drop by my Discord server: ${blueChar}${discordInvite}
You can suggest new features on Discord: ${blueChar}${discordInvite}
You can find screenshots of all my kits on Discord: ${blueChar}${discordInvite}
Stay up-to-date on my Discord: ${blueChar}${discordInvite}
Source code is on my Discord: ${blueChar}${discordInvite}
 `.trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => dcColorChar + line);

// advertise the kit feature
const kitAds = `
Just ask me for a kit by typing ${blueChar}kit [name]
I have more kits than any other bot: ${blueChar}kit [name]
Enjoy kits with no cooldown: ${blueChar}kit [name]

Need totems? ${blueChar}kit totems
Travelling somewhere? ${blueChar}kit travel
Need a bed to set your spawn? ${blueChar}kit beds
You can get a random kit: ${blueChar}kit random

List of kits I have: ${blueChar}kits
There are so many kits to chose from: ${blueChar}kits

Order multiple kits at once: ${blueChar}&order kit1 kit2 kit3*amount
Gear up for a fight quickly: ${blueChar}&order pvp gapples totems*2
 `.trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => kitColorChar + line);

const ads: string[] = [];
if (discordInvite) {
  ads.push(...discordAds);
}

ads.push(...kitAds);

function getAd(): string {
  return ads[random(0, ads.length - 1)];
}

export const advertisingPlugin: BotPlugin = (bot) => {
  bot.once('canSpeak', async () => {
    let messages = 0;
    bot.on('chat', () => { messages++; });

    let nextAd = Date.now() + random(MIN_DELAY, MAX_DELAY);

    while (!bot._client.ended) {
      if (Date.now() >= nextAd) {
        // prevent ads when the server is inactive
        if (messages < 40) {
          console.log('sending ad, but not enough messages, trying later', `${messages} / 40`);

          nextAd += random(0, MIN_DELAY);
          continue;
        }

        const ad = getAd();

        console.log('sending ad:', ad);
        bot.chat(ad);
        
        nextAd = Date.now() + random(MIN_DELAY, MAX_DELAY);
        messages = 0;
      }

      await sleep(5000);
    }
  });
};
