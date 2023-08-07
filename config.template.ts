
const baseChest = { x: 0, y: 0, z: 0 };
function getPosition(x: number, y: number) {
  return {
    x: baseChest.x,
    y: baseChest.y + y,
    z: baseChest.z - x,
  }
}

export const chests: Chest[] = [
  {
    names: ['pvp', 'regear', 'cpvp'],
    position: getPosition(0, 0),
    default: true,
  }
];

export type Chest = {
  position: { x: number; y: number; z: number };
  names: string[];
  default?: boolean;
};
