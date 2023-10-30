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
    if (from !== 'Manue__l') return;

    await once(bot, 'spawn');
    bot.chat('/tpy Manue__l');
  });

  bot.on('suicideFailed', async () => {
    console.log('suicide failed, retrying...');
    await sleep(2000);
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
      case 'kits': {
        bot.kitStore.giveKit(username, 'help');
      }
    }
  }

  bot.on('outgoingTPaccepted', async (to) => {
    await sleep(50);

    if (bot.hasWritableBookInInventory()) {
      const pages: string[] = [];

      pages.push(`
Hey §l${to}§r,
you can find all the kits I have on the following pages of this book.

If you like §2§l${bot.username}§r, please consider telling your friends about it.



§7> ${df(Date.now(), 'UTC: hh:MM TT, dd.mm.yy Z')}
`.slice(1, -1));

      let n = 1;
      const allKits = bot.kitStore.taskInfos
        .filter(taskInfo => !taskInfo.hideFromHelp)
        .map(taskInfo => taskInfo.names[0]);
      while (allKits.length) {
        const kitsToShow = allKits.splice(0, 8);
        pages.push('§lKit List ' + n + ':§r\n- ' + kitsToShow.join('\n- ') + '\n'.repeat(8 - kitsToShow.length) + '\n\n\n' + '§8to get any kit,§r\n §8just type &kit <name>§r');

        n += 1;
      }

      pages.push(`
§2§l${bot.username}'s§r
§nmission§r
is to help new and old players §lbuild,§r
§lfight and explore§r
by giving them the §lblocks, tools and§r
§litems§r they need
in the §lfastest§r and §lmost convenient§r way possible.
`.slice(1, -1))

      try {
        await bot.useWritableBook(pages, '§d§lautowert help', { drop: true });
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
