import { Task } from '../task';
import type { Bot } from 'mineflayer';
import type { Vec3 } from 'vec3';

export class TaskOpenChest extends Task {
  protected chestPosition: Vec3;

  constructor(chestPosition: Vec3) {
    super();

    this.chestPosition = chestPosition;
  }

  async execute(bot: Bot) {
    const chestBlock = bot.blockAt(this.chestPosition);
    if (!chestBlock) {
      throw new Error('chestBlock not found');
    }

    const chest = await bot.openChest(chestBlock);
  }
}
