import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';
import { createWriteStream } from 'fs';
import { sleep } from '../../util/sleep';

const writeStream = createWriteStream('data/blacklist.jsonl', { flags: 'a' });

export const blacklistPlugin: BotPlugin = (bot) => {
  bot.blacklistPlayer = (username, reason) => {
    return new Promise((resolve, reject) => {
      const onIgnoreListener: BotEvents['ignoredPlayer'] = async (username) => {
        await sleep(1000);
        bot.chat(`/msg ${username} You are now blacklisted ${reason ? 'for ' + reason + '.' : 'without a specified reason.'}`);

        writeStream.write(JSON.stringify({ username, reason, status: 'ignored' }) + '\n');

        cleanup();
        resolve('ignored');
      };
      const onUnignoreListener: BotEvents['unignoredPlayer'] = async (username) => {
        await sleep(1000);
        bot.chat(`/msg ${username} You are no longer blacklisted${reason ? ' (' + reason + ')' : ''}.`);

        writeStream.write(JSON.stringify({ username, reason, status: 'unignored' }) + '\n');

        cleanup();
        resolve('unignored');
      };

      bot.on('ignoredPlayer', onIgnoreListener);
      bot.on('unignoredPlayer', onUnignoreListener);

      const timeout = setTimeout(() => {
        cleanup();
        reject('/ignore timed out');
      }, 3000);

      const cleanup = () => {
        bot.off('ignoredPlayer', onIgnoreListener);
        bot.off('unignoredPlayer', onUnignoreListener);
        clearTimeout(timeout);
      };

      bot.chat(`/ignore ${username}`);
    });
  };
};

declare module 'mineflayer' {
  interface Bot {
    blacklistPlayer: (username: string, reason?: string) => Promise<'ignored' | 'unignored'>;
  }
}
