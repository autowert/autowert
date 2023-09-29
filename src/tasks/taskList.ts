import { sleep } from '../util/sleep';
import { Task } from './task';

const taskListDefaultOptions: TaskListOptions = {
  delay: 0,
};

export class TaskList extends Task {
  protected tasks: Task[];
  protected options: TaskListOptions;

  constructor(tasks: Task[], options?: Partial<TaskListOptions>) {
    super();

    this.tasks = tasks;
    this.options = { ...taskListDefaultOptions, ...options };
  }

  async execute(...args: Parameters<Task['execute']>) {
    for (const [index, task] of this.tasks.entries()) {
      if (index !== 0) await sleep(this.options.delay);

      await task.execute(...args);
    }
  }

  getName() {
    const taskName = this.constructor.name;
    const subTaskNames = this.tasks.map(task => task.getName());
    return `${taskName} [${subTaskNames.join(', ') || '<empty>'}]`;
  }
}

export type TaskListOptions = {
  delay: number;
};
