import type { Plugin as BotPlugin } from 'mineflayer';
import { directionOffsets, directionYaws } from '../tasks/chest/taskEnsureNearBlock';
import { once } from 'events';
import { sleep } from '../util/sleep';

export const walkABlockPlugin: BotPlugin = (bot) => {
  async function walkABlock() {
    let timesWalked = 0;
    for (const [direction, offset] of Object.entries(directionOffsets)) {
      const forthFeetBlock =
        bot.blockAt(bot.entity.position.offset(offset[0], 0, offset[1]));
      const forthHeadBlock =
        bot.blockAt(bot.entity.position.offset(offset[0], 1, offset[1]));

      const canWalk = [
        forthFeetBlock, forthHeadBlock,
      ].every((block) => block && block.boundingBox === 'empty');

      if (!canWalk) continue;

      bot.look(directionYaws[direction as keyof typeof directionYaws], 0);

      bot.setControlState('forward', true);
      await bot.waitForTicks(6);
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      await bot.waitForTicks(6);
      bot.setControlState('back', false);

      timesWalked += 1;
      if (timesWalked >= 2) break;
    }

    if (timesWalked > 0) {
      console.log('bot walked a block, can speak now');
      bot.emit('canSpeak');
    } else {
      // throw new Error('failed to walk a block');
      console.warn('Failed to walk a block');
    }
  }

  bot.once('mainServer', () => {
    walkABlock();

    bot.on('death', () => {
      bot.once('spawn', async () => {
        // for some reason, the server spawns the player twice, and the bot can only walk after the second one
        const reason = await Promise.any([
          once(bot, 'spawn').then(() => 'spawn'),
          sleep(2000).then(() => 'sleep'),
        ]);

        if (reason === 'sleep')
          console.log('second spawn event not emitted within 2000 ms, walking a block to speak anyway');

        walkABlock();
      });
    });

    bot.on('walkToSpeak', walkABlock);
  });
};

declare module 'mineflayer' {
  interface BotEvents {
    canSpeak: () => Promise<void> | void;
  }
}
