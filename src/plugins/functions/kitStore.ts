import type { TaskInfo } from '../../../config';

declare module 'mineflayer' {
  interface Bot {
    kitStore: {
      taskInfos: TaskInfo[];
      defaultTaskInfo: TaskInfo | false;

      pendingRequests: Set<string>;
      totalRequests: Map<string, number>;

      giveKit: (username: string, kitName?: string) => Promise<void>;
    }
  }
}
