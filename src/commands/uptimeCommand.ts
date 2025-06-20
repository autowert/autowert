import { ChatCommand } from './ChatCommand';

export const uptimeCommand = new ChatCommand({
  name: 'uptime',
  description: 'Shows connection time and process uptime.',

  adminOnly: true,

  invokeTypeOnly: 'private',

  execute: ({ bot }) => bot.uptime.getPretty(),
});
