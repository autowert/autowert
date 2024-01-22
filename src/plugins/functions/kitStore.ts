import type { TaskInfo } from '../../../config';

type BotTaskInfo = TaskInfo & {
  isOutOfStock?: boolean;
};

declare module 'mineflayer' {
  interface Bot {
    kitStore: {
      taskInfos: BotTaskInfo[];
      defaultTaskInfo: BotTaskInfo | false;

      pendingRequests: Set<string>;
      totalRequests: Map<string, number>;

      getKit: (username: string, kitName?: string) => Promise<{ success: boolean }>;
    }
  }
}
