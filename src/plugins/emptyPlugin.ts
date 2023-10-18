import type { Plugin as BotPlugin } from 'mineflayer';

export const emptyPlugin: BotPlugin = (bot) => {

};

declare module 'mineflayer' {
  interface Bot {
    // extend the bot interface, if needed
  }
}
