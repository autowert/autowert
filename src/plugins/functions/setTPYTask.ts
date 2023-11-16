import type { Plugin as BotPlugin } from 'mineflayer';
import type { Task } from '../../tasks/task';

export const setTPYTaskPlugin: BotPlugin = (bot) => {
  const TPYTasks = new Map<string, Task>();

  bot.on('outgoingTPdenied', (to) => { TPYTasks.delete(to); });
  bot.on('outgoingTPtimeout', (to) => { TPYTasks.delete(to); });

  // TODO: think about a better solution maybe
  bot.on('death', () => { TPYTasks.clear(); });

  bot.TPYTask = {
    set(username, task) {
      TPYTasks.set(username.toLowerCase(), task);
    },
    get(username) {
      return TPYTasks.get(username.toLowerCase());
    },

    has(username) {
      return TPYTasks.has(username.toLowerCase());
    },

    async execute(username) {
      if (!TPYTasks.has(username.toLowerCase())) return;

      const task = TPYTasks.get(username.toLowerCase())!;
      TPYTasks.delete(username.toLowerCase());

      return task.execute(bot);
    },
  };
};

declare module 'mineflayer' {
  interface Bot {
    TPYTask: {
      set: (username: string, task: Task) => void;
      get: (username: string) => Task | undefined;

      has: (username: string) => boolean;

      execute: (username: string) => Promise<void>;
    }
  }
}
