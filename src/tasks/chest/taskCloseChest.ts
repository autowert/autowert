import { Task } from '../task';
import type { Bot, Chest } from 'mineflayer';

export class TaskCloseChest extends Task {
  async execute(bot: Bot) {
    const chest = bot.currentWindow as Chest | null;
    if (chest) {
      chest.close();
    } else {
      console.warn(`${this.getName()}: chest not open`);
    }
  }
}
