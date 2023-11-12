console.clear();

import { once } from 'events';
import mineflayer, { type BotOptions } from 'mineflayer';
import { Vec3 } from 'vec3';

import df from 'dateformat';

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

import { sleep } from './util/sleep';
import { parseMsg } from './util/parseMsg';
import { TaskWriteHelpBook } from './tasks/items/taskWriteHelpBook';
import { playerNearNotificationPlugin } from './plugins/playerNearNotificationPlugin';
import { chestPositions } from '../config';

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
    if (from === 'Manue__l') bot.chat('/tpy Manue__l');
    else if (from === 'GoogleComStuff') {
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
    }
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

  bot.on('chat', (username, message) => {
    if (
      username === bot.username ||
      username === 'whispers' ||
      !Object.keys(bot.players).includes(username)
    ) {
      return;
    }

    handleMessage(username, message);
  });
  bot.on('whisper', (username, message) => {
    if (!Object.keys(bot.players).includes(username)) {
      return;
    }

    handleMessage(username, message);
  });

  async function handleMessage(username: string, message: string) {
    const cmdMessage = message.replace(/^\W+/, '');
    const { cmd, args } = parseMsg(cmdMessage);

    switch (cmd) {
      case 'kit': {
        const type = args[0]?.toLowerCase();
        bot.kitStore.giveKit(username, type);
      } break;

      case 'kits':
      case 'list': {
        bot.kitStore.giveKit(username, 'help');
      } break;

      case 'opkit': {
        if (username !== 'Manue__l') return;

        const kit = args[0]?.toLowerCase();
        const chestPos = (chestPositions as any)[kit] as Vec3 | undefined;

        if (!kit || !chestPos) return bot.chat('/w ' + username + ' usage: opkit <kitname>');

        const chestBlock = bot.blockAt(chestPos);
        if (!chestBlock) return;

        const chest = await bot.openChest(chestBlock);
        for (let slot = 0; slot < chest.inventoryStart; slot++) {
          try {
            await bot.windowInteractions.shiftLeftClick(slot);
          } catch (err) { console.log('transaction failed'); }
          await sleep(20);
        }

        await chest.close();
        bot.chat('/tpa ' + username);
      } break;
    }
  }

  bot.on('outgoingTPaccepted', async (to) => {
    await sleep(50);

    if (bot.hasWritableBookInInventory()) {
      try {
        await new TaskWriteHelpBook(to).execute(bot);
      } catch {
        console.warn('failed to write help book');
      }
    }

    bot.chat('/kill');
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
