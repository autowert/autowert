import type { Plugin as BotPlugin } from 'mineflayer';

export const chatPatternsPlugin: BotPlugin = (bot) => {
  bot.on('messagestr', (msg) => {
    const incomingTPrequestMatch = /^Type \/tpy ([A-Za-z0-9_]+) to accept or \/tpn \1 to deny\.$/.exec(msg);
    if (incomingTPrequestMatch && incomingTPrequestMatch[1])
      bot.emit('incomingTPrequest', incomingTPrequestMatch[1]);

    const incomingTPacceptedMatch = /^Request from ([A-Za-z0-9_]+) accepted!$/.exec(msg);
    if (incomingTPacceptedMatch && incomingTPacceptedMatch[1])
      bot.emit('incomingTPaccepted', incomingTPacceptedMatch[1]);

    const incomingTPdeniedMatch = /^Request from ([A-Za-z0-9_]+) denied!$/.exec(msg);
    if (incomingTPdeniedMatch && incomingTPdeniedMatch[1])
      bot.emit('incomingTPdenied', incomingTPdeniedMatch[1]);

    const incomingTPtimeoutMatch = /^The teleport request from ([A-Za-z0-9_]+) timed out\.$/.exec(msg);
    if (incomingTPtimeoutMatch && incomingTPtimeoutMatch[1])
      bot.emit('incomingTPtimeout', incomingTPtimeoutMatch[1]);

    const incomingTPdoneMatch = /^([A-Za-z0-9_]+) teleported to you!$/.exec(msg);
    if (incomingTPdoneMatch && incomingTPdoneMatch[1])
      bot.emit('incomingTPdone', incomingTPdoneMatch[1]);

    const outgoingTPrequestMatch = /^Request sent to: ([A-Za-z0-9_]+)$/.exec(msg);
    if (outgoingTPrequestMatch && outgoingTPrequestMatch[1])
      bot.emit('outgoingTPrequest', outgoingTPrequestMatch[1]);

    const outgoingTPacceptedMatch = /^Your request was accepted, teleporting to: ([A-Za-z0-9_]+)$/.exec(msg);
    if (outgoingTPacceptedMatch && outgoingTPacceptedMatch[1])
      bot.emit('outgoingTPaccepted', outgoingTPacceptedMatch[1]);

    const outgoingTPdeniedMatch = /^Your request sent to ([A-Za-z0-9_]+) was denied!$/.exec(msg);
    if (outgoingTPdeniedMatch && outgoingTPdeniedMatch[1])
      bot.emit('outgoingTPdenied', outgoingTPdeniedMatch[1]);

    const outgoingTPtimeoutMatch = /^Your teleport request to ([A-Za-z0-9_]+) timed out.$/.exec(msg);
    if (outgoingTPtimeoutMatch && outgoingTPtimeoutMatch[1])
      bot.emit('outgoingTPtimeout', outgoingTPtimeoutMatch[1]);

    const outgoingTPdoneMatch = /^Teleported to ([A-Za-z0-9_]+)!$/.exec(msg);
    if (outgoingTPdoneMatch && outgoingTPdoneMatch[1])
      bot.emit('outgoingTPdone', outgoingTPdoneMatch[1]);

    // TODO: send outgoing tp failed or incoming tp failed
    const teleportFailedMatch = /^Teleport failed!$/.exec(msg);
    if (teleportFailedMatch)
      bot.emit('teleportFailed');

    // const suicideFailedMatch = /^Sorry, Death is too busy at the moment\. Please try again later\.\.\.$/.exec(msg);
    const suicideFailedMatch = /^(?:&c)?Sorry, Death is too busy at the moment\. Please try again later\.\.\.(?:&r)?$/.exec(msg);
    if (suicideFailedMatch)
      bot.emit('suicideFailed');

    const ignoredPlayerMatch = /^Chat messages from ([A-Za-z0-9_]+) will be hidden\.$/.exec(msg);
    if (ignoredPlayerMatch && ignoredPlayerMatch[1])
      bot.emit('ignoredPlayer', ignoredPlayerMatch[1]);

    const unignoredPlayerMatch = /^Chat messages from ([A-Za-z0-9_]+) will be shown\.$/.exec(msg);
    if (unignoredPlayerMatch && unignoredPlayerMatch[1])
      bot.emit('unignoredPlayer', unignoredPlayerMatch[1]);
  });
};

declare module 'mineflayer' {
  interface BotEvents {
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

    teleportFailed: () => Promise<void> | void;
    suicideFailed: () => Promise<void> | void;

    ignoredPlayer: (username: string) => Promise<void> | void;
    unignoredPlayer: (username: string) => Promise<void> | void;
  }
}
