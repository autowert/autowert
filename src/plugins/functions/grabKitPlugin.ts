import type { Plugin as BotPlugin } from 'mineflayer';
import type { Chest as chestInfo } from '../../../config';
import { Vec3 } from 'vec3';
import { inspect } from 'util';

export const grabKitPlugin: BotPlugin = (bot) => {
  bot.grabKit = async (chestInfo) => {
    const { position: chestCoords } = chestInfo;
    const chestPosition = new Vec3(chestCoords.x, chestCoords.y, chestCoords.z);


    const chestBlock = bot.blockAt(chestPosition);
    if (!chestBlock) {
      console.log(
        'chestBlock not found:', chestBlock,
        'distance:', bot.entity.position.distanceTo(chestPosition)
      );

      console.log('sync getColumnAt:', inspect(bot.world.getColumnAt(chestPosition), false, 2));
      console.log('async getColumnAt:', inspect(await bot.world.async.getColumnAt(chestPosition), false, 2));

      console.log('loaded chunks: ', Object.keys(bot.world.async.columns));

      throw new Error('chestBlock not found');
    }

    const chest = await bot.openChest(chestBlock);
    try {
      const item = chest.slots.find((item) => item !== null);
      if (item) {
        await chest.withdraw(item.type, null, 1);
      }
    } catch (err) { }
    await chest.close();
  };
};

declare module 'mineflayer' {
  interface Bot {
    grabKit: (chestInfo: chestInfo) => Promise<void>;
  }
}
