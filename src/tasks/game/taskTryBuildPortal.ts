import { Vec3 } from 'vec3';
import { Task } from '../task';
import type { Bot } from 'mineflayer';
import { sleep } from '../../util/sleep';

const offsets: Offset[] = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
]

export class TaskTryBuildPortal extends Task {
  async execute(bot: Bot) {
    await Promise.any([
      bot.waitForChunksToLoad(),
      sleep(5000),
    ]);

    await sleep(5000);

    const obsidianSlot = bot.inventory.slots.findIndex((slot) => slot && slot.name === 'obsidian');
    if (obsidianSlot === -1) throw new Error('obsidian not found in inventory');

    const obsidianHotbarSlot = obsidianSlot >= 36 && obsidianSlot <= 44
      ? obsidianSlot
      : 36;

    if (obsidianHotbarSlot !== obsidianSlot) await bot.windowInteractions.swapWithQuickbarSlot(obsidianSlot, obsidianHotbarSlot - 36);
    bot.setQuickBarSlot(obsidianHotbarSlot - 36);

    const possiblePortalPositions = findPortalPosition(bot);
    if (possiblePortalPositions.length === 0) throw new Error('no possible portal positions found');

    const portal = possiblePortalPositions.at(0)!;

    const portalBlocks = getPortalBlockPositions(portal);
    /* const setPortalBlocks = new Set(portalBlocks);

    while (setPortalBlocks.size > 0) {
      const placableBlockPositions = portalBlocks
        .filter((blockPos) => setPortalBlocks.has(blockPos))
        .filter((blockPos) => getSolidNeighbourBlockPositions(bot, blockPos).length > 0)

      if (placableBlockPositions.length === 0) throw new Error('not all blocks were placed, but no block can be placed anymore');

      for (const blockToPlacePosition of placableBlockPositions) {
        // const block = bot.blockAt(blockToPlacePosition);
        // if (block && block.name === 'obsidian') {
        setPortalBlocks.delete(blockToPlacePosition);
        // continue;
        // }

        const neighbours = getSolidNeighbourBlockPositions(bot, blockToPlacePosition);
        if (neighbours.length === 0) throw new Error('block with neighbours has no neighbour, wtf');

        for (const neighbour of neighbours) {
          const [refPos, offset] = neighbour;
          const refBlock = bot.blockAt(refPos);
          if (!refBlock) throw new Error('refBlock not defined'); // this should never happen

          bot.placeBlock(refBlock, new Vec3(...offset)).catch(() => console.log('block placement failed'));
          await sleep(50);
        }
      }
    } */

    let iteration = 0;
    while (true) {
      let placed = 0;

      for (const blockPos of portalBlocks) {
        const block = bot.blockAt(blockPos);
        if (block && block.name === 'obsidian') {
          placed++;
          continue;
        }

        const neighbours = getSolidNeighbourBlockPositions(bot, blockPos);
        if (neighbours.length === 0) continue;

        for (const [neighbourPos, offset] of neighbours) {
          const neighbourBlock = bot.blockAt(neighbourPos);
          if (!neighbourBlock) throw new Error('neighbourBlock not defined'); // this should never happen

          bot.placeBlock(neighbourBlock, new Vec3(...offset))
            .catch(() => console.log('block placement failed'));
        }

        await sleep(50);
      }

      if (placed === portalBlocks.length) break;
      if (iteration > 20) throw new Error('failed to build portal with 10 iterations');

      iteration++;

      await sleep(50);
    }

    const flintSlot = bot.inventory.slots.findIndex((slot) => slot && slot.name === 'flint_and_steel');
    if (flintSlot === -1) throw new Error('flint not found in inventory');

    const flintHotbarSlot = flintSlot >= 36 && flintSlot <= 44
      ? flintSlot
      : 37;

    if (flintHotbarSlot !== flintSlot) await bot.windowInteractions.swapWithQuickbarSlot(flintSlot, flintHotbarSlot - 36);
    bot.setQuickBarSlot(flintHotbarSlot - 36);

    const flintRefPos1 = portal.startPosition.x < portal.endPosition.x
      ? portal.startPosition.offset(1, 0, 0)
      : portal.startPosition.offset(0, 0, 1);
    const flintRefBlock1 = bot.blockAt(flintRefPos1);
    if (!flintRefBlock1) throw new Error('flintRefBlock not found'); // this should also never happen

    const flintRefPos2 = portal.startPosition.x < portal.endPosition.x
      ? portal.startPosition.offset(2, 1, 0)
      : portal.startPosition.offset(0, 0, 2);
    const flintRefBlock2 = bot.blockAt(flintRefPos2);
    if (!flintRefBlock2) throw new Error('flintRefBlock not found'); // this should also never happen

    bot.placeBlock(flintRefBlock1, new Vec3(0, 1, 0)).catch(() => console.log('failed to place flint block'));
    bot.placeBlock(flintRefBlock2, new Vec3(0, 1, 0)).catch(() => console.log('failed to place flint block'));
  }
}

function findPortalPosition(bot: Bot, size = { width: 4, height: 5 }) {
  const botPosition = bot.entity.position.clone().round();

  const blockIsEmpty = (pos: Vec3) => {
    const block = bot.blockAt(pos);
    return block && block.name === 'air';
  }

  const spacePossiblePortals: PossiblePortal[] = [];

  const searchStart = botPosition.offset(-3, -3, -3);
  const searchEnd = botPosition.offset(3, 5, 3);

  searchStart.y = Math.max(searchStart.y, 0);
  searchEnd.y = Math.min(searchEnd.y, 255);

  // console.log('searching for portal spots', searchStart, searchEnd);

  for (let y = searchStart.y; y <= searchEnd.y - size.height; y++) {
    for (let z = searchStart.z; z <= searchEnd.z; z++) {
      for (let x = searchStart.x; x <= searchEnd.x - size.width; x++) {
        const startPosition = new Vec3(x, y, z);
        const endPosition = startPosition.offset(size.width - 1, size.height - 1, 0);

        let foundNonEmptyBlock = false;
        for (let xP = startPosition.x; xP <= endPosition.x; xP++) {
          for (let yP = startPosition.y; yP <= endPosition.y; yP++) {
            const checkBlockPosition = new Vec3(xP, yP, z);
            const isEmpty = blockIsEmpty(checkBlockPosition);

            foundNonEmptyBlock = foundNonEmptyBlock || !isEmpty;
          }
        }

        if (!foundNonEmptyBlock) {
          spacePossiblePortals.push({ startPosition, endPosition });
        }
      }
    }

    for (let x = searchStart.x; x <= searchEnd.x; x++) {
      for (let z = searchStart.z; z <= searchEnd.z - size.width; z++) {
        const startPosition = new Vec3(x, y, z);
        const endPosition = startPosition.offset(0, size.height - 1, size.width - 1);

        let foundNonEmptyBlock = false;
        for (let zP = startPosition.z; zP <= endPosition.z; zP++) {
          for (let yP = startPosition.y; yP <= endPosition.y; yP++) {
            const checkBlockPosition = new Vec3(x, yP, zP);
            const isEmpty = blockIsEmpty(checkBlockPosition);

            foundNonEmptyBlock = foundNonEmptyBlock || !isEmpty;
          }
        }

        if (!foundNonEmptyBlock) {
          spacePossiblePortals.push({ startPosition, endPosition });
        }
      }
    }
  }

  // console.log('space possible portals:\n', spacePossiblePortals.map(portal => ({ ...portal, blocks: getPortalBlockPositions(portal) })));

  const placablePossiblePortals = spacePossiblePortals.filter((spacePossiblePortal) => {
    const portalBlockPositions = getPortalBlockPositions(spacePossiblePortal);
    return portalBlockPositions.some((pos) => getSolidNeighbourBlockPositions(bot, pos).length > 0);
  });

  return placablePossiblePortals.filter((placablePossiblePortal) => {
    const portalBlockPositions = getPortalBlockPositions(placablePossiblePortal);
    return portalBlockPositions.every((pos) => bot.entity.position.distanceTo(pos) >= 1);
  });
}

// TODO: this needs to be in src/plugins and extend the bot
function getSolidNeighbourBlockPositions(bot: Bot, position: Vec3): [Vec3, Offset][] {
  const offsetPositions: [Vec3, Offset][] = [];

  for (const offset of offsets) {
    const offsetPosition = position.offset(...offset);
    const offsetBlock = bot.blockAt(offsetPosition);

    if (!offsetBlock) continue;

    if (offsetBlock.boundingBox !== 'block') continue;

    if (offsetBlock.shapes.length !== 1) continue;
    const shape0 = offsetBlock.shapes[0];
    if (
      shape0[0] !== 0 ||
      shape0[1] !== 0 ||
      shape0[2] !== 0 ||
      shape0[3] !== 1 ||
      shape0[4] !== 1 ||
      shape0[5] !== 1
    ) continue;

    offsetPositions.push([offsetPosition, offset.map(n => n * -1) as Offset]);
  }

  return offsetPositions;
}

function getPortalBlockPositions(portal: PossiblePortal): Vec3[] {
  const blockPositions = [];

  for (let y = portal.startPosition.y + 1; y < portal.endPosition.y; y++) {
    blockPositions.push(new Vec3(portal.startPosition.x, y, portal.startPosition.z));
    blockPositions.push(new Vec3(portal.endPosition.x, y, portal.endPosition.z));
  }
  if (portal.startPosition.x < portal.endPosition.x) {
    for (let x = portal.startPosition.x; x <= portal.endPosition.x; x++) {
      blockPositions.push(new Vec3(x, portal.startPosition.y, portal.startPosition.z));
      blockPositions.push(new Vec3(x, portal.endPosition.y, portal.startPosition.z));
    }
  } else {
    for (let z = portal.startPosition.z; z <= portal.endPosition.z; z++) {
      blockPositions.push(new Vec3(portal.startPosition.x, portal.startPosition.y, z));
      blockPositions.push(new Vec3(portal.startPosition.x, portal.endPosition.y, z));
    }
  }

  return blockPositions;
}

type PossiblePortal = {
  startPosition: Vec3;
  endPosition: Vec3;
}

type Offset = [number, number, number];
