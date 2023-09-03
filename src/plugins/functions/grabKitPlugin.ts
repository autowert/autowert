import type { Plugin as BotPlugin } from 'mineflayer';
import { Vec3 } from 'vec3';
import { inspect } from 'util';
import './kitStore';

export const grabKitPlugin: BotPlugin = (bot) => {
  if (!bot.kitStore) bot.kitStore = {} as any;

  bot.kitStore.grabKit = async (chestInfo, amount = 1) => {
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
      const targetItem = chest.slots.find((item) => item !== null);

      if (targetItem) {
        // @ts-ignore wrong nbt types
        const targetItemName: string | undefined = targetItem?.nbt?.value?.display?.value?.Name?.value;

        let matchingItemsInInventory = bot.inventory.slots.filter((inventoryItem) => {
          if(!inventoryItem) return false;

          if (inventoryItem.type !== targetItem.type) return false;
          if (inventoryItem.metadata !== targetItem.metadata) return false;

          if (targetItem.nbt) {
            if (!inventoryItem.nbt) return false;
            // @ts-ignore wrong nbt types
            const inventoryItemName: string | undefined = inventoryItem?.nbt?.value?.display?.value?.Name?.value;

            if (inventoryItemName !== targetItemName) return false;
          }

          return true;
        }).length;

        console.log('grabbing kit with name', targetItemName, ', already', matchingItemsInInventory, 'kits in inventory');

        try {
          if (amount - matchingItemsInInventory === 0) console.log('kit already in inventory, not grabbing');
          while (amount - matchingItemsInInventory > 0) {
            // @ts-ignore wrong types: window.withdraw(itemType, metadata, count, nbt)
            await chest.withdraw(targetItem.type, targetItem.metadata, null, targetItem.nbt);

            matchingItemsInInventory += 1;
          }
        } catch (err) {
          console.error('failed to grab kit in loop');
          console.error(err);
        }
      } else {
        console.warn('no targetItem in chest, is the chest empty?', chestInfo.names[0]);
      }
    } catch (err) {
      console.error('error in grabkit');
      console.error(err)
    }
    await chest.close();
  };
};
