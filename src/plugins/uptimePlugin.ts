import type { Plugin as BotPlugin } from 'mineflayer';

import prettyMS from 'pretty-ms';
import { getProcessUptime } from '../util/processUptime';

export const uptimePlugin: BotPlugin = (bot) => {
  bot.uptime = {
    createdAt: Date.now(),
    connectedSince: null,

    getPretty: () => '',
  };
  
  bot.once('mainServer', () => {
    bot.uptime.connectedSince = Date.now();
  });

  bot.uptime.getPretty = () => {
    const processUptime = getProcessUptime();
    const prettyProcessUptime = prettyMS(processUptime, {
      unitCount: 3,
    });
    
    const botIsConnected = bot.uptime.connectedSince !== null;
    const botUptime = Date.now() - (botIsConnected ? bot.uptime.connectedSince! : bot.uptime.createdAt);
    const prettyBotUptime = prettyMS(botUptime, {
      unitCount: 3,
    });

    return `Bot ${botIsConnected ? 'is connected since' : 'was created'} ${prettyBotUptime}${botIsConnected ? '' : 'ago (NOT CONNECTED)'}. Process is up since ${prettyProcessUptime}.`;
  };
};

declare module 'mineflayer' {
  interface Bot {
    uptime: {
      createdAt: number;
      connectedSince: number | null;

      getPretty: () => string;
    }
  }
}
