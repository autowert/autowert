import prettyMS from 'pretty-ms';
import { ChatCommand } from './ChatCommand';

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

  execute: ({ bot, invokerUsername }) => {
    const stats = bot.playerTimeStats.getPlayerStats(invokerUsername);
    if (!stats) return `Try again later, ${invokerUsername}!`

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

    if (!lockedNameColors.length) return `You already got all free name colors, ${invokerUsername}.`;

    const nextNameColor = lockedNameColors[0];
    const requiredPT = nextNameColor.minPT - pt;
    const requiredJD = nextNameColor.minJD - jd;

    return `Hey ${invokerUsername}, the next name color you will unlock is ${nextNameColor.name}. You need ${requiredJD > 0 ? `${prettyMS(requiredJD, { verbose: true, unitCount: 2 })} more join date` : ''}${requiredPT > 0 && requiredJD > 0 ? ' and ' : ''}${requiredPT > 0 ? `${prettyMS(requiredPT, { verbose: true, unitCount: 2 })} more play time` : ''}.`;
  },
});

type NameColor = {
  name: string;

  minJD: number;
  minPT: number;
}
