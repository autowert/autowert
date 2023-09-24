import { Task } from './task';

export class TaskList extends Task {
  protected tasks: Task[];

  constructor(tasks: Task[]) {
    super();

    this.tasks = tasks;
  }

  async execute(...args: Parameters<Task['execute']>) {
    for (const task of this.tasks) {
      await task.execute(...args);
    }
  }

  getName() {
    const taskName = this.constructor.name;
    const subTaskNames = this.tasks.map(task => task.getName());
    return `${taskName} [${subTaskNames.join(', ') || '<empty>'}]`;
  }
}
