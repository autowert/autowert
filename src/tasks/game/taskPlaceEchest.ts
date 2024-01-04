import { Vec3 } from 'vec3';
import { Task } from '../task';
import type { Bot } from 'mineflayer';
import { sleep } from '../../util/sleep';

import { getSolidNeighbourBlockPositions } from './taskTryBuildPortal';

export class TaskPlaceEchest extends Task {
  async execute(bot: Bot) {
    await Promise.any([
      bot.waitForChunksToLoad(),
      sleep(5000),
    ]);

    const echestSlot = bot.inventory.slots.findIndex((slot) => slot && slot.name === 'ender_chest');
    if (echestSlot === -1) throw new Error('echest not found in inventory');

    const echestHotbarSlot = echestSlot >= 36 && echestSlot <= 44
      ? echestSlot
      : 36;

    if (echestHotbarSlot !== echestSlot) await bot.windowInteractions.swapWithQuickbarSlot(echestSlot, echestHotbarSlot - 36);
    bot.setQuickBarSlot(echestHotbarSlot - 36);

    const possibleEchestPositions = findEchestPositions(bot);
    if (possibleEchestPositions.length === 0) throw new Error('no possible echest positions found');

    // prefer positions where the echest is close to the players head
    const getDistance = (pos: Vec3) => bot.entity.position.offset(0, 1.7, 0).distanceTo(pos);
    const echestPosition = possibleEchestPositions
      .sort((posA, posB) => getDistance(posA) - getDistance(posB))
      .at(0)!;

    const [echestRefPos, offset] = getSolidNeighbourBlockPositions(bot, echestPosition).at(0)!;
    const echestRefBlock = bot.blockAt(echestRefPos)!;

    await sleep(200);

    await bot.placeBlock(echestRefBlock, new Vec3(...offset))
      .catch(() => console.log('failed to place echest'));

    await sleep(100);
  }
}

function findEchestPositions(bot: Bot) {
  const botPosition = bot.entity.position.clone().round();

  const blockIsEmpty = (pos: Vec3) => {
    const block = bot.blockAt(pos);
    return block && block.name === 'air';
  }

  const searchStart = botPosition.offset(-2, -2, -2);
  const searchEnd = botPosition.offset(2, 2, 2);

  searchStart.y = Math.max(searchStart.y, 0);
  searchEnd.y = Math.min(searchEnd.y, 255);

  const possibleEchestPositions = [];

  for (let y = searchStart.y; y <= searchEnd.y; y++) {
    for (let x = searchStart.x; x <= searchEnd.x; x++) {
      for (let z = searchStart.z; z <= searchEnd.z; z++) {
        const echestPos = new Vec3(x, y, z);
        const aboveBlock = echestPos.offset(0, 1, 0);

        if (
          blockIsEmpty(echestPos) &&
          blockIsEmpty(aboveBlock) &&
          getSolidNeighbourBlockPositions(bot, echestPos).length > 0
        ) {
          possibleEchestPositions.push(echestPos);
        }
      }
    }
  }

  return possibleEchestPositions.filter((echestPos) => {
    return bot.entity.position.distanceTo(echestPos) >= 1
  });
}
