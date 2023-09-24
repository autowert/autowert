import type { Bot } from 'mineflayer';

export class Task {
  async execute(bot: Bot): Promise<void> {
    // intentionally empty, method will be overwritten
  }

  getName() {
    const taskName = this.constructor.name;
    return taskName;
  }
}
