import { sleep } from '../util/sleep';
import { Task } from './task';


export class TaskRandom extends Task {
  protected tasks: Task[];

  constructor(tasks: Task[]) {
    super();

    if (tasks.length === 0) {
      throw new Error('at least one subtask is required for TaskRandom');
    }

    this.tasks = tasks;
  }

  async execute(...args: Parameters<Task['execute']>) {
    const task = this.tasks[Math.floor(Math.random() * this.tasks.length)];
    return task.execute(...args);
  }

  getName() {
    const taskName = this.constructor.name;
    const subTaskNames = this.tasks.map(task => task.getName());
    return `${taskName} [${subTaskNames.join(' | ') || '<empty>'}]`;
  }
}
