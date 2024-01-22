import { ChatCommand } from './ChatCommand';

import { sleep } from '../util/sleep';

export const blacklistCommand = new ChatCommand({
  name: 'blacklist',
  description: 'Blacklist (or unblacklist) a player.',
  usage: '<player> [reason]',

  prefixOverwrite: /.*/,

  adminOnly: true,

  execute: async ({ bot, args }) => {
    const [_target, ..._reason] = args;
    const reason = _reason.join(' ');

    if (!_target)
      return 'Usage: blacklist <username> [reason]';

    const target = Object.keys(bot.players)
      .find((player) => player.toLowerCase() === _target.toLowerCase());
    if (!target)
      return 'The target user is not online.';

    const status = await bot.blacklistPlayer(target, reason);

    await sleep(2000);
    return `${target} is now ${status}.`;
  },
});
