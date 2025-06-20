import type { Plugin as BotPlugin } from 'mineflayer';

import prettyMS from 'pretty-ms';
import { getProcessUptime } from '../util/processUptime';

export const uptimePlugin: BotPlugin = (bot) => {
  bot.uptime = {
    createdAt: Date.now(),
    connectedSince: null,

    getPretty: () => '',
    getTime() {
      const botIsConnected = bot.uptime.connectedSince !== null;
      const botUptime = Date.now() - (botIsConnected ? bot.uptime.connectedSince! : bot.uptime.createdAt);

      return botUptime;
    }
  };

  bot.once('mainServer', () => {
    bot.uptime.connectedSince = Date.now();
  });

  bot.uptime.getPretty = () => {
    const botIsConnected = bot.uptime.connectedSince !== null;
    const processUptime = getProcessUptime();
    const botUptime = bot.uptime.getTime();

    const options = { unitCount: 3 };
    const prettyProcessUptime = prettyMS(processUptime, options);
    const prettyBotUptime = prettyMS(botUptime, options);

    return `Bot ${botIsConnected ? 'is connected since' : 'was created'} ${prettyBotUptime}${botIsConnected ? '' : 'ago (NOT CONNECTED)'}. Process is up since ${prettyProcessUptime}.`;
  };
};

declare module 'mineflayer' {
  interface Bot {
    uptime: {
      createdAt: number;
      connectedSince: number | null;

      getPretty: () => string;
      getTime: () => number;
    }
  }
}
