import { TaskList } from '../taskList';
import type { Vec3 } from 'vec3';

import { TaskEnsureNearBlock } from './taskEnsureNearBlock';
import { TaskOpenChest } from './taskOpenChest';
import { TaskGrabItemsFromChest } from './taskGrabItemsFromChest';
import { TaskCloseChest } from './taskCloseChest';

export class TaskGrabItemsFromChestAndClose extends TaskList {
  protected chestPosition: Vec3;
  protected amount;

  constructor(chestPosition: Vec3, amount = 1) {
    super([]);

    this.chestPosition = chestPosition;
    this.amount = amount;

    this.tasks.push(
      new TaskEnsureNearBlock(this.chestPosition, 6),
      new TaskOpenChest(this.chestPosition),
      new TaskGrabItemsFromChest(this.amount),
      new TaskCloseChest(),
    );
  }
}
