console.clear();

import { once } from 'events';
import mineflayer, { BotEvents, type BotOptions } from 'mineflayer';

import { registerExitHandler } from './util/exitHandler';
import './util/persistentLog'
import './util/httpServer';
import './util/debugHelper';
import './util/handleUncaught';

import { uptimePlugin } from './plugins/uptimePlugin';
import { chatPatternsPlugin } from './plugins/chatPatternsPlugin';
import { logPlugin } from './plugins/logPlugin';
import { queueHandlerPlugin } from './plugins/queueHandlerPlugin';
import { tpsPlugin } from './plugins/tpsPlugin';
import { getConnectedContainersPlugin } from './plugins/getConnectedContainers';
import { windowInteractionsPlugin } from './plugins/windowInteractionsPlugin';

import { giveKitPlugin } from './plugins/functions/giveKitPlugin';
import { useWritableBookPlugin } from './plugins/useWritableBookPlugin';
import { blacklistPlugin } from './plugins/functions/blacklistPlugin';

import { sleep } from './util/sleep';
import { playerNearNotificationPlugin } from './plugins/playerNearNotificationPlugin';
import { setTPYTaskPlugin } from './plugins/functions/setTPYTask';
import { getPlayerTimeStatsPlugin } from './plugins/getPlayerTimeStatsPlugin';
import { walkABlockPlugin } from './plugins/walkABlockPlugin';
import { advertisingPlugin } from './plugins/advertisingPlugin';
import { commandHandlerPlugin } from './plugins/commandHandlerPlugin';
import { statisticsPlugin } from './plugins/statisticsPlugin';
import { tpyPlugin } from './plugins/tpyPlugin';
import { antiQueueStuckPlugin } from './plugins/antiQueueStuckPlugin';
import { fisOpenChestPlugin } from './plugins/fixOpenChest';

import { handleDeathPlugin } from './plugins/handlers/handleDeath';
import { handleSuicideFailedPlugin } from './plugins/handlers/handleSuicideFailed';
import { handleTPPlugin } from './plugins/handlers/handleTP';

const botOptions: BotOptions = {
  username: 'autowert',
  auth: 'microsoft',

  version: '1.20.4',
  host: '0b0t.org',
  port: 25565,

  plugins: {
    uptimePlugin,
    chatPatternsPlugin,
    logPlugin,
    queueHandlerPlugin,
    giveKitPlugin,
    tpsPlugin,
    // getConnectedContainersPlugin,
    windowInteractionsPlugin,
    useWritableBookPlugin,
    playerNearNotificationPlugin,
    setTPYTaskPlugin,
    getPlayerTimeStatsPlugin,
    blacklistPlugin,
    walkABlockPlugin,
    // advertisingPlugin,
    commandHandlerPlugin,
    statisticsPlugin,
    tpyPlugin,
    antiQueueStuckPlugin,
    fisOpenChestPlugin,

    handleDeathPlugin,
    handleSuicideFailedPlugin,
    handleTPPlugin,
  },

  logOptions: {
    chat: false,
    death: false,
  }
};

function createBot() {
  console.log(`connecting to ${botOptions.host}`);
  
  const localOptions = { ...botOptions };

  let waitingForAuth = false;
  localOptions.onMsaCode = (data) => {
    waitingForAuth = true;

    console.info('[C] [msa] First time signing in. Please authenticate now:');
    console.info('[C]', data.message);
  };

  const bot = mineflayer.createBot(localOptions);
  Object.assign(global, { bot });

  let shouldReconnect = true;
  const relaseExitHandler = registerExitHandler(() => {
    if (bot._client.ended) return;
    console.log('ending bot');
    shouldReconnect = false;

    bot.end();
    return Promise.race([
      sleep(3_000).then(() => console.log('waiting for bot to end timed out')),
      once(bot, 'end'),
    ]).then(() => { });
  });

  const checkBotUp = () => {
    if (bot._client.ended) {
      if (waitingForAuth) return console.log('bot seems ended, but waiting for auth');

      console.log('bot._cliend seems to be ended, emmiting end');
      bot.emit('end', '_client ended');
    }
  };
  const checkBotUpInterval = setInterval(checkBotUp, 60 * 1000);
  bot.once('end', () => {
    clearInterval(checkBotUpInterval);
  });

  bot.once('end', (reason) => {
    console.log('bot ended (%s)', reason);
    if (!shouldReconnect) {
      relaseExitHandler();
      return;
    }

    setTimeout(() => {
      relaseExitHandler();
      if (!shouldReconnect) return;

      console.log('trying to reconnect...');
      createBot();
    }, 30 * 1000);
  });
}
createBot();
