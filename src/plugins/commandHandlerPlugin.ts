import type { Plugin as BotPlugin } from 'mineflayer';
import { type Prefix, type BaseCommand, type BaseCommandContext } from '../commands/BaseCommand';

import { commands } from '../commands';
import { parseMsg } from '../util/parseMsg';

import { prefix, whitelistOptions } from '../../config';

export const commandHandlerPlugin: BotPlugin = (bot) => {
  bot.commands = commands;

  // TODO: possibly support commands loaded dynamically
  const commandMap = new Map<string, BaseCommand>();
  for (const command of commands) {
    commandMap.set(command.name, command);

    for (const alias of command.aliases) {
      commandMap.set(alias, command);
    }
  }

  const handleMessage = (params: {
    username: string,
    message: string,
    whispered: boolean,
  }) => {
    const { username, message, whispered } = params;
    if (username === bot.username) return;

    const [msgPrefix] = /^\W*/.exec(message)!;
    const cmdMessage = message.slice(msgPrefix.length);

    const { cmd, args, flags } = parseMsg(cmdMessage);

    const command = commandMap.get(cmd);
    if (!command) return;

    const msgMatchesPrefix = whispered || matchesPrefix(msgPrefix, command.prefixOverwrite || prefix);
    if (!msgMatchesPrefix) return;

    const player = bot.players[username];
    if (!player) {
      console.warn('command invoked by', username, 'but player not found')
      return;
    }

    const invokerIsAdmin = player.username === 'Manue__l';

    const ctx: BaseCommandContext = {
      bot,

      invokerUsername: username,
      invokerPlayer: player,
      invokerIsAdmin,

      invokeType: whispered ? 'private' : 'public',
      invokePrefix: msgPrefix,
      invokeMessage: message,

      args,
      flags,
    };

    if (command.invokeTypeOnly && command.invokeTypeOnly !== ctx.invokeType) return;
    if (command.adminOnly && !invokerIsAdmin) { // TODO: permission system
      console.log('Attempt to invoke admin only command %s by non-admin user %s', command.name, username);
      return;
    }

    if (whitelistOptions.whitelistOnly) {
      const isWhitelisted = invokerIsAdmin || whitelistOptions.whitelistedPlayers?.includes(username);
      if (!isWhitelisted) {
        console.info('Attempt to invoke command %s by non-whitelisted user %s', command.name, username);
        return;
      }
    }

    command.execute(ctx);
  }

  bot.on('chat', (username, message) => handleMessage({ username, message, whispered: false }));
  bot.on('whisper', (username, message) => handleMessage({ username, message, whispered: true }));
};

function matchesPrefix(prefix: string, definition: Prefix): boolean {
  if (Array.isArray(definition))
    return definition.some((def) => matchesPrefix(prefix, def));

  if (definition instanceof RegExp)
    return definition.test(prefix);

  return prefix === definition;
}

declare module 'mineflayer' {
  interface Bot {
    commands: BaseCommand[];
  }
}
