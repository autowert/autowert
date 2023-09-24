import { TaskList } from './taskList';
import type { Chest as ChestInfo } from '../../config';

import { Vec3 } from 'vec3';

import { TaskOpenChest } from './taskOpenChest';
import { TaskGrabItemsFromChest } from './taskGrabItemsFromChest';
import { TaskCloseChest } from './taskCloseChest';

export class TaskGrabItemsFromChestAndClose extends TaskList {
  protected chestInfo: ChestInfo;
  protected amount;

  protected chestPosition: Vec3;

  constructor(chestInfo: ChestInfo, amount = 1) {
    super([]);

    this.chestInfo = chestInfo;
    this.amount = amount;

    this.chestPosition = new Vec3(
      this.chestInfo.position.x,
      this.chestInfo.position.y,
      this.chestInfo.position.z
    );

    this.tasks.push(
      new TaskOpenChest(this.chestPosition),
      new TaskGrabItemsFromChest(this.amount),
      new TaskCloseChest(),
    );
  }
}
