import { Task } from '../task';
import type { Bot, Chest } from 'mineflayer';

import { logger } from '../../util/logger';

export class TaskCloseChest extends Task {
  async execute(bot: Bot) {
    const chest = bot.currentWindow as Chest | null;
    if (chest) {
      chest.close();
    } else {
      logger.warn({ taskName: this.getName() }, 'Cannot close chest as no chest is open');
    }
  }
}
