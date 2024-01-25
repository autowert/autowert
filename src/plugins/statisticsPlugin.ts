import type { Plugin as BotPlugin } from 'mineflayer';

export const statisticsPlugin: BotPlugin = (bot) => {
  const statistics = new Map<string, number>();

  bot.requestStatistics = () => {
    return new Promise((resolve, reject) => {
      bot._client.write('client_command', { actionId: 1 })

      bot._client.once('statistics', (packet, meta) => {
        const entries: { name: string, value: number }[] = packet.entries;
        for (const { name, value } of entries) {
          statistics.set(name, value);
        }

        resolve(statistics);
      });

      setTimeout(() => {
        reject(new Error('requestStatistics timed out'));
      }, 5000);
    });
  };
};

declare module 'mineflayer' {
  interface Bot {
    requestStatistics: () => Promise<Map<string, number>>;
  }
}
