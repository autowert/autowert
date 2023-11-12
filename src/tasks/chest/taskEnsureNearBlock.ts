import { Task } from '../task';
import type { Bot, BotEvents } from 'mineflayer';
import { Vec3 } from 'vec3';

type Direction = 'north' | 'east' | 'south' | 'west';
type Offset = [number, number, number];
const directionOffsets: Record<Direction, Offset> = {
  north: [0, 0, -1],
  east: [1, 0, 0],
  south: [0, 0, 1],
  west: [-1, 0, 0],
};
const directionYaws: Record<Direction, number> = {
  /* north: -180,
  east: -90,
  south: 0,
  west: 90, */
  north: 0,
  east: 1.5 * Math.PI,
  south: Math.PI,
  west: 0.5 * Math.PI,
};

export class TaskEnsureNearBlock extends Task {
  protected blockPosition: Vec3;
  protected range: number;

  constructor(blockPosition: Vec3, range = 6.2) {
    super();

    this.blockPosition = blockPosition;
    this.range = range;
  }

  async execute(bot: Bot) {
    const getDistance = (pos = bot.entity.position) => pos.distanceTo(this.blockPosition);

    const currentDistance = getDistance();
    if (currentDistance < this.range) return;

    const impact: Partial<Record<Direction, number>> = {};
    for (const [direction, offset] of Object.entries(directionOffsets) as [Direction, Offset][]) {
      const newPosition = bot.entity.position.offset(...offset);
      const newFeetBlock = bot.blockAt(newPosition);
      const newHeadBlock = bot.blockAt(newPosition.offset(0, 1, 0));

      const canWalk =
        newFeetBlock && newFeetBlock.name === 'air' &&
        newHeadBlock && newHeadBlock.name === 'air';
      if (!canWalk) continue;

      const newDistance = getDistance(newPosition);
      const distanceDifference = newDistance - currentDistance;

      if (distanceDifference >= 0) continue;
      impact[direction] = distanceDifference;
    }

    console.log('found directions and impact', impact);

    if (Object.keys(impact).length === 0)
      throw new Error('cannot walk in any direction to get closer to the target block');

    const direction = Object.keys(impact).reduce(
      //@ts-ignore weird types
      (a, b) => impact[a] < impact[b] ? a : b,
    ) as Direction;

    const yaw = directionYaws[direction];
    await bot.look(yaw, 0, false);

    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    return new Promise<void>((resolve) => {
      const moveListener: BotEvents['move'] = () => {
        const distance = getDistance();
        if (distance < this.range) {
          bot.setControlState('forward', false);
          bot.setControlState('sprint', false);

          bot.off('move', moveListener);

          resolve();
        }
      };
      bot.on('move', moveListener);
    });
  }
}
