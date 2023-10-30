import type { Plugin as BotPlugin } from 'mineflayer';
import type { Task } from '../tasks/task';

import { sleep } from '../util/sleep';

import { TaskSuicide } from '../tasks/game/taskSuicide';
import { TaskWriteHelpBook } from '../tasks/items/taskWriteHelpBook';

export const handleOutgoingTPacceptedPlugin: BotPlugin = (bot) => {
  // TODO: persistent across logins or even process restarts

  bot._outgoingTPTasks = new Map();
  bot.isProcessingTaskAway = false;

  bot.on('outgoingTPaccepted', async (to) => {
    await sleep(50); // TODO: verify if this is necessary

    bot.isProcessingTaskAway = true;

    const task = bot._outgoingTPTasks.get(to);
    if (task) {
      bot._outgoingTPTasks.delete(to);

      console.log('executing task for ' + to);
      await task.execute(bot);
    }

    if (bot.hasWritableBookInInventory()) {
      await new TaskWriteHelpBook(to).execute(bot);
    }

    await new TaskSuicide().execute(bot);
    bot.isProcessingTaskAway = false;
  });

  bot.on('outgoingTPdenied', (to) => {
    if (bot._outgoingTPTasks.has(to)) {
      bot._outgoingTPTasks.delete(to);
    }
  });
  bot.on('outgoingTPtimeout', (to) => {
    if (bot._outgoingTPTasks.has(to)) {
      bot._outgoingTPTasks.delete(to);
    }
  });
};

declare module 'mineflayer' {
  interface Bot {
    _outgoingTPTasks: Map<string, Task>;

    setOutgoingTPTask: (username: string, task: string) => void;
    hasOutgoingTP: (username: string) => boolean;

    isProcessingTaskAway: boolean;
  }
}
