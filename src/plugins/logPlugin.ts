import type { Plugin as BotPlugin } from 'mineflayer';

const defaultOptions = {
  queue: true,
  firstSpawn: true,
  spawn: false,
  death: true,

  kicked: true,
  chat: false,

  walkToSpeak: true,

  tpIncoming: true,
  tpOutgoing: true,
};

export const logPlugin: BotPlugin = (bot, botOptions) => {
  const logOptions: LogOptions =
    typeof botOptions.logOptions === 'boolean'
      ? Object.fromEntries(Object.keys(defaultOptions).map(key => [key, botOptions.logOptions])) as LogOptions
      : {
        ...defaultOptions,
        ...botOptions.logOptions,
      };

  if (logOptions.queue) {
    bot.on('queuePosition', (position) => {
      console.log(`Position in queue: ${position}!`);
    });
    bot.once('queueDone', () => {
      console.log('Queue is done.');
    });
    bot.once('noQueue', () => {
      console.log('No queue detected.');
    });
    bot.once('mainServer', () => {
      console.log('Bot connected to main server.');
    });
  }

  if (logOptions.firstSpawn) {
    bot.once('spawn', () => {
      console.log(`${bot.username} spawned on ${botOptions.host}.`);
    });
  }
  if (logOptions.spawn) {
    let isFirstSpawn = logOptions.firstSpawn;
    bot.on('spawn', () => {
      if (isFirstSpawn) {
        isFirstSpawn = false;
        return;
      }
      console.log('bot spawned');
    })
  }

  if (logOptions.death) {
    bot.on('death', () => {
      console.log(`bot died`);
    });
  }

  if (logOptions.kicked) {
    bot.on('kicked', (reason) => {
      console.log(`bot was kicked for ${reason || 'unknown'}`);
    });
  }

  if (logOptions.chat) {
    bot.on('message', (msg) => {
      console.log(msg.toAnsi());
    });
  }

  if (logOptions.walkToSpeak) {
    bot.on('walkToSpeak', () => {
      console.log('bot has to walk a block to speak');
    });
  }

  /*
  incomingTPrequest: (from: string) => Promise<void> | void;
  incomingTPaccepted: (from: string) => Promise<void> | void;
  incomingTPdenied: (from: string) => Promise<void> | void;
  incomingTPtimeout: (from: string) => Promise<void> | void;
  incomingTPdone: (from: string) => Promise<void> | void;

  outgoingTPrequest: (to: string) => Promise<void> | void;
  outgoingTPaccepted: (to: string) => Promise<void> | void;
  outgoingTPdenied: (to: string) => Promise<void> | void;
  outgoingTPtimeout: (to: string) => Promise<void> | void;
  outgoingTPdone: (to: string) => Promise<void> | void;
  */

  if (logOptions.tpIncoming) {
    bot.on('incomingTPrequest', (from) => console.log(`${from} requested to teleport to the bot.`));
    bot.on('incomingTPaccepted', (from) => console.log(`Accepted tp request from ${from}.`));
    bot.on('incomingTPdenied', (from) => console.log(`Denied tp request from ${from}.`));
    bot.on('incomingTPtimeout', (from) => console.log(`The tp request from ${from} timed out.`));
    bot.on('incomingTPdone', (from) => console.log(`${from} teleported to the bot.`));
  }
  if (logOptions.tpOutgoing) {
    bot.on('outgoingTPrequest', (to) => console.log(`Requested to teleport to ${to}.`));
    bot.on('outgoingTPaccepted', (to) => console.log(`${to} accepted the tp request.`));
    bot.on('outgoingTPdenied', (to) => console.log(`${to} denied the tp request.`));
    bot.on('outgoingTPtimeout', (to) => console.log(`The tp request to ${to} timed out.`));
    bot.on('outgoingTPdone', (to) => console.log(`Teleported to ${to}.`));
  }

  if (logOptions.tpIncoming || logOptions.tpOutgoing) {
    bot.on('teleportFailed', () => console.log(`Teleport failed.`))
  }
};

type LogOptions = typeof defaultOptions;

declare module 'mineflayer' {
  interface BotOptions {
    logOptions?: Partial<LogOptions> | boolean;
  }
}
