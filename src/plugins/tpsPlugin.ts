import type { Plugin as BotPlugin } from 'mineflayer';

export const tpsPlugin: BotPlugin = (bot) => {
  bot.once('mainServer', () => {
    const average: number[] = [];
    let lastUpdate: LastUpdate;

    bot.getTps = () => {
      return average.length > 0
        ? average.reduce((last, current) => last + current, 0) / average.length
        : null;
    }

    bot._client.on('update_time', (packet, meta) => {
      const age: bigint = packet.age;
      const time: bigint = packet.age;

      const now = BigInt(Date.now());
      if (lastUpdate) {
        const ageDiff = Math.abs(Number(packet.age - lastUpdate.age));
        const timeDiff = Math.abs(Number(now - lastUpdate.date));
        const timePerTick = timeDiff / ageDiff;

        const tps = Math.min(20, 20 / (timePerTick / 50));

        average.push(tps);
        if (average.length > 5) average.shift();
      }

      lastUpdate = {
        date: now,
        age: age,
      };
    });
  });
};

type LastUpdate = {
  date: bigint;
  age: bigint;
}

declare module 'mineflayer' {
  interface Bot {
    getTps: () => number | null;
  }
}
