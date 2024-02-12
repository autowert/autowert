import prettyMS from 'pretty-ms';
import { ChatCommand } from './ChatCommand';
import { TimeStats } from '../plugins/getPlayerTimeStatsPlugin';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const getNameColor = (name: string, jdDays: number, ptHours: number): NameColor => ({
  name,
  minJD: jdDays * ONE_DAY,
  minPT: ptHours * ONE_HOUR,
});

const nameColors: NameColor[] = [
  getNameColor('gray', 0, 0),
  getNameColor('white', 3, 3),
  getNameColor('green', 6, 6),
  getNameColor('blue', 12, 12),
  getNameColor('dark_purple', 23, 24),
  getNameColor('gold', 46, 48),
  getNameColor('red', 92, 96),
  getNameColor('yellow', 183, 192),
  getNameColor('aqua + bold', 365, 384),
  getNameColor('dark_red', 730, 768),
  getNameColor('dark_gray + italic', 1460, 1536),
];

export const nextncCommand = new ChatCommand({
  name: 'nextnc',
  description: 'Shows the next name color you will get.',
  // usage: '[username]',

  // adminOnly: true,

  execute: ({ bot, invokerUsername, args }) => {
    const targetIsInvoker = !args[0] || args[0].toLowerCase() === invokerUsername.toLowerCase() || !/^[A-Za-z0-9_]{3,16}$/.test(args[0]);
    const target = targetIsInvoker ? invokerUsername : args[0];

    let stats: TimeStats | undefined;
    let statsCached = false;

    if (targetIsInvoker) {
      stats = bot.playerTimeStats.getPlayerStats(target);
    } else {
      const targetPlayer = Object.values(bot.players).find((player) => player.username.toLowerCase() === target.toLowerCase());
      if (targetPlayer) {
        stats = bot.playerTimeStats.getPlayerStats(targetPlayer.username);
      } else {
        const cached = Array.from(bot.playerTimeStats._playerTimeStats.values()).find((stats) => stats.username.toLowerCase() === target.toLowerCase());
        if (!cached) return `That person is not online.`;

        stats = cached;
        statsCached = true;
      }
    }

    if (!stats) return `Try again later, ${invokerUsername}!`;

    const unlockedNameColors: NameColor[] = [];
    const lockedNameColors: NameColor[] = [];

    const pt = stats.pt;

    // for every 24 hours of pt you get +8 hours jd
    let jd = stats.jd;
    jd += (pt / ONE_DAY) * (8 * ONE_HOUR);

    for (const nameColor of nameColors) {
      if (
        jd >= nameColor.minJD &&
        pt >= nameColor.minPT
      ) {
        unlockedNameColors.push(nameColor);
      } else {
        lockedNameColors.push(nameColor);
      }
    }

    // TODO: see below
    if (!lockedNameColors.length) return `You already got all free name colors, ${stats.username}.`;

    const nextNameColor = lockedNameColors[0];
    const requiredPT = nextNameColor.minPT - pt;
    const requiredJD = nextNameColor.minJD - jd;

    // TODO: format message according to targetIsInvoker
    return `Hey ${stats.username}, the next name color you will unlock is ${nextNameColor.name}. You need ${requiredJD > 0 ? `${prettyMS(requiredJD, { verbose: true, unitCount: 2 })} more join date` : ''}${requiredPT > 0 && requiredJD > 0 ? ' and ' : ''}${requiredPT > 0 ? `${prettyMS(requiredPT, { verbose: true, unitCount: 2 })} more play time` : ''}${statsCached ? ' (CACHED)' : ''}.`;
  },
});

type NameColor = {
  name: string;

  minJD: number;
  minPT: number;
}
