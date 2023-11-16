import { Task } from './task';

export class TaskCustomFunction extends Task {
  constructor(executeFn: Task['execute']) {
    super();

    this.execute = executeFn;
  }

  getName() {
    return `TaskCustomFunction < ${this.execute}>`;
  }
}
