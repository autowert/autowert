import type { Plugin as BotPlugin, BotEvents } from 'mineflayer';
import { Vec3 } from 'vec3';

export const eflyPlugin: BotPlugin = (bot) => {
  let isFlying = false;
  const eflyState: EflyState = {
    forward: false,
    up: false,
    down: false,
  };

  bot._client.on('entity_metadata', (data) => {
    const { entityId } = data;
    if (entityId !== bot.entity.id) return;

    for (const metadata of data.metadata) {
      if (metadata.key !== 0) continue;

      const newIsFlying = Boolean(metadata.value & 0x80);
      if (isFlying !== newIsFlying) {
        isFlying = newIsFlying;
        bot.emit('elytraFlight', isFlying);
      }
    }
  });

  // https://github.com/PrismarineJS/mineflayer/blob/master/lib/plugins/physics.js#L99-L108
  function sendPacketPosition(position: Vec3, onGround: boolean) {
    const oldPos = bot.entity.position.clone();
    const packet = {} as any;
    packet.x = position.x
    packet.y = position.y
    packet.z = position.z
    packet.onGround = onGround
    bot._client.write('position', packet)
    bot.emit('move', oldPos)
  }

  // https://github.com/PrismarineJS/mineflayer/blob/master/lib/plugins/physics.js#L120-L131
  function sendPacketPositionAndLook(position: Vec3, yaw: number, pitch: number, onGround: boolean) {
    const oldPos = bot.entity.position.clone();
    const packet = {} as any;
    packet.x = position.x;
    packet.y = position.y;
    packet.z = position.z;
    packet.yaw = yaw;
    packet.pitch = pitch;
    packet.onGround = onGround;
    bot._client.write('position_look', packet);
    bot.emit('move', oldPos);
  }

  async function equip() {
    const armorItem = bot.inventory.slots[6];
    if (armorItem && armorItem.name === 'elytra') return;

    for (let slotId = 9; slotId <= 44; slotId++) {
      const item = bot.inventory.slots[slotId];
      if (!item) continue;

      if (item.name === 'elytra') {
        await bot.windowInteractions.leftClick(slotId);
        await bot.windowInteractions.leftClick(6);
        return;
      }
    }

    throw new Error('no elytra item');
  }

  function takeoff() {
    return new Promise<void>((resolve, reject) => {
      const startY = bot.entity.position.y;
      bot.setControlState('jump', true);

      let maxDy = 0;
      const moveListener: BotEvents['move'] = () => {
        const dy = bot.entity.position.y - startY;

        if (dy > maxDy) maxDy = dy;

        if (dy < maxDy) {
          bot.off('move', moveListener);
          bot.setControlState('jump', false)

          bot._client.write('entity_action', {
            entityId: bot.entity.id,
            actionId: 8, // Start flying with elytra 
            jumpBoost: 0,
          });

          const onElytraFlightListener: BotEvents['elytraFlight'] = (isFlying) => {
            bot.off('elytraFlight', onElytraFlightListener);

            if (isFlying) resolve();
            else reject(new Error('player is not flying'));
          };
          bot.on('elytraFlight', onElytraFlightListener);

          setTimeout(() => {
            bot.off('elytraFlight', onElytraFlightListener);

            reject(new Error('elytra flight takeoff timeout'));
          }, 2000);
        }
      }
      bot.on('move', moveListener);
    });
  }

  bot.on('elytraFlight', (isFlying) => {
    bot.physicsEnabled = !isFlying;
  });
  bot.on('death', () => {
    bot.physicsEnabled = true;
  });

  async function doEflyPhysics() {
    if (bot.physicsEnabled || !isFlying) return;

    bot.emit('eflyTick');

    const { yaw } = bot.entity;
    const dx = eflyState.forward ? -Math.sin(yaw) * bot.efly.speedC : 0;
    const dz = eflyState.forward ? -Math.cos(yaw) * bot.efly.speedC : 0;

    const dy = eflyState.up ? 5 / 20 : eflyState.down ? -5 / 20 : 0;

    if (dx === 0 && dz === 0 && dy === 0) return;

    const newPosition = bot.entity.position.offset(dx, dy, dz);

    // sendPacketPositionAndLook(newPosition, 0, 0, false);
    sendPacketPosition(newPosition, false);

    bot.entity.position.x = newPosition.x;
    bot.entity.position.y = newPosition.y;
    bot.entity.position.z = newPosition.z;

  }
  setInterval(doEflyPhysics, 1000 / 20);

  function setState(state: keyof EflyState, value: boolean) {
    eflyState[state] = value;
    if (state === 'up' && value) eflyState.down = false;
    if (state === 'down' && value) eflyState.up = false;
  }
  function clearState() {
    eflyState.forward = false;
    eflyState.up = false;
    eflyState.down = false;
  }

  // @ts-ignore setting initial value to object
  bot.efly = {};
  bot.efly.speedC = 3.44;

  Object.defineProperty(bot.efly, 'isFlying', {
    get: () => isFlying,
    set: () => { throw new Error('cannot set readonly bot.efly.isFlying'); },
  });

  bot.efly.equip = equip;
  bot.efly.takeoff = takeoff;

  bot.efly.setState = setState;
  bot.efly.clearState = clearState;
};

type EflyState = {
  forward: boolean;
  up: boolean;
  down: boolean;
}

declare module 'mineflayer' {
  interface Bot {
    efly: {
      speedC: number;

      readonly isFlying: boolean;

      equip: () => Promise<void>;
      takeoff: () => Promise<void>;

      setState: (state: keyof EflyState, value: boolean) => void; // TODO: use number between 0 and 1 to set speed
      clearState: () => void;
    }
  }
  interface BotEvents {
    eflyTick: () => void;
    elytraFlight: (isFlying: boolean) => void;
  }
}
