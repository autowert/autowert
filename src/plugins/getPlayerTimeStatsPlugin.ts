import type { Plugin as BotPlugin } from 'mineflayer';

const ONE_HOUR = 60 * 60 * 1000;
const UPDATE_AFTER = ONE_HOUR;

const units = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24,
  years: 1000 * 60 * 60 * 24 * 365,
};
function parseTimeStr(timeStr: string): number {
  let totalTime = 0;

  if (timeStr === 'now')
    return totalTime;

  const parts = timeStr.match(/(\d+)\s(\w+)/g);
  if (!parts) throw new Error('invalid time string (no part match): ' + timeStr)

  for (const part of parts) {
    const match = /(\d+)\s(\w+)/.exec(part);
    if (!match || match.length !== 3) throw new Error('invalid part (this should never happen)');

    const amount = Number(match[1]);
    const unit = match[2].endsWith('s') ? match[2] : match[2] + 's';

    if (unit in units === false) {
      console.warn('[parseTimeStr]', 'unknown unit', unit, '(', timeStr, ')');
      continue;
    }
    const unitTime = units[unit as keyof typeof units];

    const time = amount * unitTime;
    totalTime += time;
  }

  return totalTime;
}

// persistent across bot reconnects
const playerTimeStats = new Map<string, TimeStats>();

export const getPlayerTimeStatsPlugin: BotPlugin = (bot) => {
  bot.on('messagestr', (msg) => {
    const playerTimeStatsMatch = /^([A-Za-z0-9_]+) joined the server (.+?) ago and played for (.+?)\.$/.exec(msg);
    if (!playerTimeStatsMatch || playerTimeStatsMatch.length !== 4) return;


    const username = playerTimeStatsMatch[1];
    const jdStr = playerTimeStatsMatch[2];
    const ptStr = playerTimeStatsMatch[3];

    try {
      const jd = parseTimeStr(jdStr);
      const pt = parseTimeStr(ptStr);

      const stats: TimeStats = { username, jd, pt, updatedAt: Date.now() };
      bot.emit('playerTimeStats', stats);
    } catch (err) {
      console.warn('error with time string', { username, msg, jdStr, ptStr });
      console.warn(err);
    }
  });

  const pending = new Set<string>();
  bot.on('playerTimeStats', (stats) => {
    pending.delete(stats.username);
    playerTimeStats.set(stats.username, stats);
  });

  bot.once('mainServer', () => {
    let iteration = 0;

    const getStatsInterval = setInterval(() => {
      const players = Object.keys(bot.players);
      const player = players.find((username) => {
        if (pending.has(username)) return false;
        if (!playerTimeStats.has(username)) return true;

        const stats = playerTimeStats.get(username)!;
        return stats.updatedAt + UPDATE_AFTER < Date.now();
      });

      if (!player) return;

      // TODO: command handlers
      pending.add(player);
      const command = iteration % 2 ? 'jd' : 'pt';
      bot.chat(`/${command} ${player}`);

      iteration++;
    }, 2000);

    bot.once('end', () => clearInterval(getStatsInterval));
  });

  bot.playerTimeStats = {
    get _playerTimeStats() {
      return playerTimeStats;
    },
    get _pending() {
      return pending;
    },

    hasPlayerStats: (username) => playerTimeStats.has(username),
    getPlayerStats: (username) => playerTimeStats.get(username),
  };
};

export type TimeStats = {
  // TODO: maybe remove username here, not sure
  username: string;
  pt: number;
  jd: number;

  updatedAt: number;
}

declare module 'mineflayer' {
  interface Bot {
    playerTimeStats: {
      get _playerTimeStats(): typeof playerTimeStats;
      get _pending(): Set<string>,

      hasPlayerStats: (username: string) => boolean;
      getPlayerStats: (username: string) => TimeStats | undefined;
    }
  }
  interface BotEvents {
    playerTimeStats: (stats: TimeStats) => Promise<void> | void;
  }
}
