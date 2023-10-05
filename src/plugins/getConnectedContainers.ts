import type { Plugin as BotPlugin } from 'mineflayer';
import { Vec3 } from 'vec3';

const DEBUG_GETCONNECTEDCONTAINERS = false;

function isContainer(blockName: string): boolean {
  if (blockName === 'hopper') return true;
  if (blockName === 'chest') return true;
  if (blockName === 'trapped_chest') return true;

  return false;
}

const offsetFacing: [
  [number, number, number],
  string
][] = [
    [[0, 0, 1], 'north'],
    [[0, 0, -1], 'south'],
    [[1, 0, 0], 'west'],
    [[-1, 0, 0], 'east'],
  ];
const containerStacks: Record<ContainerInfo['name'], number> = {
  chest: 3 * 9,
  trapped_chest: 3 * 9,
  hopper: 5,
};

export const getConnectedContainersPlugin: BotPlugin = (bot) => {
  bot.getConnectedContainers = (pos) => {
    const block = bot.blockAt(pos);
    if (!block) return [];

    const firstContainerInfo: ContainerInfo = { position: pos, name: block.name as any };

    const containers: ContainerInfo[] = [firstContainerInfo];
    function hasContainer(pos: Vec3): boolean {
      for (const container of containers) {
        if (container.position.equals(pos)) return true;
      }
      return false;
    }

    function getConnectedContainers(pos: Vec3): ContainerInfo[] {
      const block = bot.blockAt(pos);
      if (!block || !isContainer(block.name)) return [];

      if (DEBUG_GETCONNECTEDCONTAINERS)
        console.log('getting containers from block', block.name, 'at', pos.toArray().join(' '));

      const connectedContainers: ContainerInfo[] = [];

      const upPos = pos.offset(0, 1, 0);
      const blockUp = bot.blockAt(upPos);
      if (!hasContainer(upPos) && blockUp && isContainer(blockUp.name)) {
        const containerInfo: ContainerInfo = { position: upPos, name: blockUp.name as any };

        if (block.name === 'hopper') { // a hopper always gets items from the container above
          const properties: HopperProperties = block.getProperties() as any;
          if (properties.enabled) {
            connectedContainers.push(containerInfo);
          }
        } else if (blockUp.name === 'hopper') {
          const properties: HopperProperties = blockUp.getProperties() as any;
          if (
            properties.facing === 'down' &&
            properties.enabled !== 'false' && properties.enabled
          ) {
            connectedContainers.push(containerInfo);
          }
        }
      }

      for (const [offset, facing] of offsetFacing) {
        const offsetPos = pos.offset(...offset);
        if (hasContainer(offsetPos)) continue;

        const offsetBlock = bot.blockAt(offsetPos);
        if (!offsetBlock || !isContainer(offsetBlock.name)) continue;

        const containerInfo: ContainerInfo = { position: offsetPos, name: offsetBlock.name as any };

        if (offsetBlock.name === 'hopper') {
          const properties: HopperProperties = offsetBlock.getProperties() as any;
          if (properties.enabled === 'false' || !properties.enabled) continue; // ignore blocked hoppers

          if (properties.facing !== facing) continue;
          connectedContainers.push(containerInfo);
        } else if (offsetBlock.name === 'chest' || offsetBlock.name === 'trapped_chest') {
          // TODO: fix this for versions 1.14+ where same chests can be next to each other withot being connected
          if (offsetBlock.name !== block.name) continue;
          connectedContainers.push(containerInfo);
        }
      }

      if (DEBUG_GETCONNECTEDCONTAINERS)
        console.log('found', connectedContainers.length, 'containers\n');

      return connectedContainers;
    }

    function getConnectedContainersRecursively(pos: Vec3): void {
      for (const connectedContainer of getConnectedContainers(pos)) {
        containers.push(connectedContainer);
        getConnectedContainersRecursively(connectedContainer.position);
      }
    }
    getConnectedContainersRecursively(pos);

    return containers;
  };
};

export function getTotalStacks(containerInfos: ContainerInfo[]): number {
  const containerCount = new Map<ContainerInfo['name'], number>();

  for (const containerInfo of containerInfos) {
    const { name } = containerInfo;
    if (containerCount.has(name)) containerCount.set(name, containerCount.get(name)! + 1);
    else containerCount.set(name, 1);
  }

  let totalStacks = 0;
  for (const [name, count] of containerCount) {
    totalStacks += count * containerStacks[name];
  }

  return totalStacks;
}

type HopperProperties = {
  facing: 'north' | 'east' | 'south' | 'west' | 'down';
  enabled: 'true' | 'false';
}

export type ContainerInfo = {
  position: Vec3;
  name: 'hopper' | 'chest' | 'trapped_chest';
}

declare module 'mineflayer' {
  interface Bot {
    getConnectedContainers: (pos: Vec3) => ContainerInfo[];
  }
}
