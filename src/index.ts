console.clear();

import { once } from 'events';
import mineflayer, { BotEvents, type BotOptions } from 'mineflayer';
import { Vec3 } from 'vec3';

import './util/persistentLog'
import './util/httpServer';

import { uptimePlugin } from './plugins/uptimePlugin';
import { chatPatternsPlugin } from './plugins/chatPatternsPlugin';
import { logPlugin } from './plugins/logPlugin';
import { queueHandlerPlugin } from './plugins/queueHandlerPlugin';
import { tpsPlugin } from './plugins/tpsPlugin';
import { getConnectedContainersPlugin, getTotalStacks } from './plugins/getConnectedContainers';
import { windowInteractionsPlugin } from './plugins/windowInteractionsPlugin';

import { giveKitPlugin } from './plugins/functions/giveKitPlugin';
import { useWritableBookPlugin } from './plugins/useWritableBookPlugin';
import { blacklistPlugin } from './plugins/functions/blacklistPlugin';

import { sleep } from './util/sleep';
import { TaskWriteHelpBook } from './tasks/items/taskWriteHelpBook';
import { playerNearNotificationPlugin } from './plugins/playerNearNotificationPlugin';
import { eflyPlugin } from './plugins/eflyPlugin';
import { setTPYTaskPlugin } from './plugins/functions/setTPYTask';
import { getPlayerTimeStatsPlugin } from './plugins/getPlayerTimeStatsPlugin';
import { walkABlockPlugin } from './plugins/walkABlockPlugin';
import { advertisingPlugin } from './plugins/advertisingPlugin';
import { TaskGetWritableBook } from './tasks/items/taskGetWritableBook';
import { commandHandlerPlugin } from './plugins/commandHandlerPlugin';
import { statisticsPlugin } from './plugins/statisticsPlugin';

const botOptions: BotOptions = {
  username: 'autowert',
  auth: 'microsoft',

  version: '1.12.2',
  host: '0b0t.org',
  port: 25565,

  plugins: {
    uptimePlugin,
    chatPatternsPlugin,
    logPlugin,
    queueHandlerPlugin,
    giveKitPlugin,
    tpsPlugin,
    getConnectedContainersPlugin,
    windowInteractionsPlugin,
    useWritableBookPlugin,
    playerNearNotificationPlugin,
    eflyPlugin,
    setTPYTaskPlugin,
    getPlayerTimeStatsPlugin,
    blacklistPlugin,
    walkABlockPlugin,
    advertisingPlugin,
    commandHandlerPlugin,
    statisticsPlugin,
  },

  logOptions: {
    chat: false,
    death: false,
  }
};

function createBot() {
  console.log(`connecting to ${botOptions.host}`);

  const localOptions = { ...botOptions };

  const bot = mineflayer.createBot(localOptions);
  Object.assign(global, { bot });

  const checkBotUp = () => {
    if (bot._client.ended) {
      console.log('bot._cliend seems to be ended, emmiting end');
      bot.emit('end', '_client ended');
    }
  };
  const checkBotUpInterval = setInterval(checkBotUp, 60 * 1000);
  bot.once('end', () => {
    clearInterval(checkBotUpInterval);
  });

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

  bot.on('death', () => {
    bot.clearControlStates();
  });
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

    bot.off('death', deathListener);
    if (!died) bot.chat('/kill');
  });

  bot.once('end', (reason) => {
    console.log('bot ended', reason);

    setTimeout(() => {
      console.log('trying to reconnect...');
      createBot();
    }, 30 * 1000);
  });
}
createBot();

Object.assign(global, {
  Vec3,
  mineflayer,
  getTotalStacks,
  TaskGetWritableBook,
});

const debuggerEnabled = process.execArgv.includes('--inspect');
if (debuggerEnabled) {
  process.stdout.write = () => true;

  process.once('beforeExit', () => {
    console.log('debugger enabled, keeping process alive');
    setInterval(() => { }, 2000);
  });
}

process.stdin.on('data', async (data) => {
  const code = data.toString('utf8');

  try {
    const result = await eval(code);
    console.log(result || 'done');
  } catch (err) {
    console.log('failed to run code');
    console.log(err);
  }
});
