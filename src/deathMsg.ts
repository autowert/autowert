/* const deathRegexes = [
  '(?<target>[A-Za-z0-9_]*) blew up',
  '(?<target>[A-Za-z0-9_]*) was blown up by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was fireballed by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was impaled by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was killed by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was killed while trying to hurt (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was pummeled by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was shot by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was slain by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was doomed to fall by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) went up in flames',
  '(?<target>[A-Za-z0-9_]*) withered away',
  '(?<target>[A-Za-z0-9_]*) hitlered away',
  '(?<target>[A-Za-z0-9_]*) broke their fucking legs',
  '(?<target>[A-Za-z0-9_]*) forgot about air',
  '(?<target>[A-Za-z0-9_]*) broke his neck and the rest of his body',
  '(?<target>[A-Za-z0-9_]*) thought he could fly\\. What an autist\\.\\.\\.',
  '(?<target>[A-Za-z0-9_]*) walked the plank',
  "(?<target>[A-Za-z0-9_]*) couldn't pay his rent and ended it all",
  "(?<target>[A-Za-z0-9_]*) couldn't pay his rent and ended it all",
  '(?<target>[A-Za-z0-9_]*) took a leap of faith',
  '(?<target>[A-Za-z0-9_]*) took the easy way out',
  '(?<target>[A-Za-z0-9_]*) tried to swim in lava',
  '(?<target>[A-Za-z0-9_]*) thought he was a fish',
  '(?<target>[A-Za-z0-9_]*) committed sudoku',
  '(?<target>[A-Za-z0-9_]*) experienced kinetic energy',
  '(?<target>[A-Za-z0-9_]*) was killed using an .*',
  '(?<target>[A-Za-z0-9_]*) burnt into a crisp whilst fighting (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) died',
  '(?<target>[A-Za-z0-9_]*) drowned whilst trying to escape (?<killer>[A-Za-z0-9_]*)',
  'And (?<target>[A-Za-z0-9_]*) was never heard from again\\.\\.\\.',
  '(?<target>[A-Za-z0-9_]*) was blown from a high place by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) was fucking destroyed by (?<killer>[A-Za-z0-9_]*)',
  '(?<target>[A-Za-z0-9_]*) tried to escape (?<killer>[A-Za-z0-9_]*) by jumping off a fucking bridge',
  '(?<target>[A-Za-z0-9_]*) has done his part in cleansing the world',
  '(?<target>[A-Za-z0-9_]*) thought they were Hausemaster, but discovered they burn',
  '(?<target>[A-Za-z0-9_]*) was a casualty of an ALLAHU AKBAR',
  '(?<target>[A-Za-z0-9_]*) suffocated in a wall',
  "(?<target>[A-Za-z0-9_]*) couldn't afford food",
  "(?<target>[A-Za-z0-9_]*) a casualty of (?<killer>[A-Za-z0-9_]*)'s ALLAHU AKBAR",
  '(?<target>[A-Za-z0-9_]*) was pricked to death',
  '(?<killer>[A-Za-z0-9_]*) tore (?<target>[A-Za-z0-9_]*) a new asshole',
].map((str) => new RegExp('^' + str + '$')); */
const deathRegexes = [
  /^(?<target>[A-Za-z0-9_]+) blew up$/,
  /^(?<target>[A-Za-z0-9_]+) was blown up by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was fireballed by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was impaled by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was killed by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was killed while trying to hurt (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was pummeled by (?<killer>[A-Za-z0-9_]*)$/,
  /^(?<target>[A-Za-z0-9_]+) was shot by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was slain by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was doomed to fall by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) went up in flames$/,
  /^(?<target>[A-Za-z0-9_]+) withered away$/,
  /^(?<target>[A-Za-z0-9_]+) hitlered away$/,
  /^(?<target>[A-Za-z0-9_]+) broke their fucking legs$/,
  /^(?<target>[A-Za-z0-9_]+) forgot about air$/,
  /^(?<target>[A-Za-z0-9_]+) broke his neck and the rest of his body$/,
  /^(?<target>[A-Za-z0-9_]+) thought he could fly\. What an autist\.\.\.$/,
  /^(?<target>[A-Za-z0-9_]+) walked the plank$/,
  /^(?<target>[A-Za-z0-9_]+) couldn't pay his rent and ended it all$/,
  /^(?<target>[A-Za-z0-9_]+) took a leap of faith$/,
  /^(?<target>[A-Za-z0-9_]+) took the easy way out$/,
  /^(?<target>[A-Za-z0-9_]+) tried to swim in lava$/,
  /^(?<target>[A-Za-z0-9_]+) thought he was a fish$/,
  /^(?<target>[A-Za-z0-9_]+) committed sudoku$/,
  /^(?<target>[A-Za-z0-9_]+) experienced kinetic energy$/,
  /^(?<target>[A-Za-z0-9_]+) was killed(?: by (?<killer>[A-Za-z0-9_]+))? using an .*$/,
  /^(?<target>[A-Za-z0-9_]+) burnt into a crisp whilst fighting (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) died$/,
  /^(?<target>[A-Za-z0-9_]+) drowned whilst trying to escape (?<killer>[A-Za-z0-9_]+)$/,
  /^And (?<target>[A-Za-z0-9_]+) was never heard from again\.\.\.$/,
  /^(?<target>[A-Za-z0-9_]+) was blown from a high place by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) was fucking destroyed by (?<killer>[A-Za-z0-9_]+)$/,
  /^(?<target>[A-Za-z0-9_]+) tried to escape (?<killer>[A-Za-z0-9_]+) by jumping off a fucking bridge$/,
  /^(?<target>[A-Za-z0-9_]+) has done his part in cleansing the world$/,
  /^(?<target>[A-Za-z0-9_]+) thought they were Hausemaster, but discovered they burn$/,
  /^(?<target>[A-Za-z0-9_]+) was a casualty of an ALLAHU AKBAR$/,
  /^(?<target>[A-Za-z0-9_]+) suffocated in a wall$/,
  /^(?<target>[A-Za-z0-9_]+) couldn't afford food$/,
  /^(?<target>[A-Za-z0-9_]+) a casualty of (?<killer>[A-Za-z0-9_]+)'s ALLAHU AKBAR$/,
  /^(?<target>[A-Za-z0-9_]+) was pricked to death$/,
  /^(?<killer>[A-Za-z0-9_]+) tore (?<target>[A-Za-z0-9_]+) a new asshole$/,

  // added in 2023
  /^(?<target>[A-Za-z0-9_]+) went off with a bang whilst fighting FIREWORK(\?)$/,
  // Manue__l experienced kinetic energy whilst trying to escape Ender Dragon
];

export function parseDeathMsg(msg: string) {
  for (const deathRegex of deathRegexes) {
    const match = deathRegex.exec(msg);
    if (!match || !match.groups) continue;
    const { target, killer } = match.groups;

    return { target, killer };
  }
  return false;
}
