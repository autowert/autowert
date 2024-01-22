import { ChatCommand } from './ChatCommand';

import prettyMS from 'pretty-ms';

export const topCommand = new ChatCommand({
  name: 'top',
  description: 'Shows the players with the most play-time or join-date.',
  // usage: '<pt|jd> [--bots]',
  usage: '<pt|jd>',

  adminOnly: true,

  execute: ({ bot, args, flags }) => {
    const type = args[0]?.toLowerCase();
    if (!type || (type !== 'pt' && type !== 'jd')) return 'Usage: top <pt|jd>';

    // TODO: filter known bots
    const includeBots = Boolean(flags['bots']);

    const _stats = Object.keys(bot.players)
      .map((username) => bot.playerTimeStats.getPlayerStats(username));

    const noStats = _stats.filter((stats) => !stats).length;
    const stats = _stats
      .filter(Boolean)
      .map((stats) => stats!);

    if (!stats.length || noStats > 4)
      return 'Not enough data.';

    const sorted = stats.sort((a, b) => b[type] - a[type]);

    const top = sorted[0];

    const followedBy = sorted.slice(1, 4);
    let followedByStr = '';
    for (const [i, stats] of followedBy.entries()) {
      const { username } = stats;

      if (i !== 0) {
        followedByStr += i === followedBy.length - 1 ? ' and ' : ', ';
      }

      followedByStr += username;
    }

    return `${top.username} has the ${type === 'pt' ? 'most play time' : 'highest join date'} with ${prettyMS(top[type], { verbose: true })}${followedBy.length ? `, followed by ${followedByStr}.` : '.'}`;
  },
});
