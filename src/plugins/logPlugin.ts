import type { Plugin as BotPlugin } from 'mineflayer';

import { inspect } from 'util';
import { logger } from '../util/logger';

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
      logger.info({ position }, 'Queue position received');
    });
    bot.once('queueDone', () => {
      logger.info('Queue is done.');
    });
    bot.once('noQueue', () => {
      logger.info('No queue detected.');
    });
    bot.once('mainServer', () => {
      logger.info('Bot connected to main server.');
    });
  }

  if (logOptions.firstSpawn) {
    bot.once('spawn', () => {
      const { username } = bot;
      const { host } = botOptions;
      logger.info({ username, host }, 'Bot spawned');
    });
  }
  if (logOptions.spawn) {
    let isFirstSpawn = logOptions.firstSpawn;
    bot.on('spawn', () => {
      if (isFirstSpawn) {
        isFirstSpawn = false;
        return;
      }

      logger.info('Bot spawned');
    })
  }

  if (logOptions.death) {
    bot.on('death', () => {
      logger.info('Bot died');
    });
  }

  if (logOptions.kicked) {
    bot.on('kicked', (reason) => {
      logger.info({ reason }, 'Bot was kicked from the server');
    });
  }

  if (logOptions.chat) {
    bot.on('message', (msg) => {
      const ansi = msg.toAnsi();
      logger.info('CHAT: ' + ansi);
    });
  }

  if (logOptions.walkToSpeak) {
    bot.on('walkToSpeak', () => {
      logger.info('Walk to speak required');
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
    bot.on('incomingTPrequest', (from) => logger.info({ from }, `${from} requested to teleport to the bot.`));
    bot.on('incomingTPaccepted', (from) => logger.info({ from }, `Accepted tp request from ${from}.`));
    bot.on('incomingTPdenied', (from) => logger.info({ from }, `Denied tp request from ${from}.`));
    bot.on('incomingTPtimeout', (from) => logger.info({ from }, `The tp request from ${from} timed out.`));
    bot.on('incomingTPdone', (from) => logger.info({ from }, `${from} teleported to the bot.`));
  }
  if (logOptions.tpOutgoing) {
    bot.on('outgoingTPrequest', (to) => logger.info({ to }, `Requested to teleport to ${to}.`));
    bot.on('outgoingTPaccepted', (to) => logger.info({ to }, `${to} accepted the tp request.`));
    bot.on('outgoingTPdenied', (to) => logger.info({ to }, `${to} denied the tp request.`));
    bot.on('outgoingTPtimeout', (to) => logger.info({ to }, `The tp request to ${to} timed out.`));
    bot.on('outgoingTPdone', (to) => logger.info({ to }, `Teleported to ${to}.`));
  }

  if (logOptions.tpIncoming || logOptions.tpOutgoing) {
    bot.on('teleportFailed', () => logger.info(`Teleport failed.`))
  }
};

type LogOptions = typeof defaultOptions;

declare module 'mineflayer' {
  interface BotOptions {
    logOptions?: Partial<LogOptions> | boolean;
  }
}
