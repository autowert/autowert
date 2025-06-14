import type { Plugin as BotPlugin } from 'mineflayer';
import { Vec3 } from 'vec3';

import { publishNotification } from '../util/notifications';

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 30 * 60 * 1000; // 30 minutes
const recentNotifications = new Map<string, number>();

export const playerNearNotificationPlugin: BotPlugin = (bot) => {
  // TODO: make this a seperate plugin,
  let botBaseLocation: Vec3;
  bot.once('death', () => {
    bot._client.once('respawn', (packet, meta) => {
      bot._client.once('position', (packet, meta) => {
        console.log('got bot spawn position after death and respawn');
        const { x, y, z } = packet;
        botBaseLocation = new Vec3(x, y, z);
      });
    })
  });

  bot.on('entitySpawn', async (entity) => {
    if (entity.type !== 'player') return;

    if (entity === bot.entity) return;

    if (!botBaseLocation) return console.warn('player near, but bot spawn location is unknown:', entity.username);
    if (bot.entity.position.distanceTo(botBaseLocation) > 100) return;

    const username = entity.username;
    if (!username) return console.warn('player entity does not have a username');

    const now = Date.now();
    if (recentNotifications.has(username)) {
      const last = recentNotifications.get(username)!;
      const diff = now - last;

      if (diff < MIN_DELAY_BETWEEN_NOTIFICATIONS) return;
    }
    recentNotifications.set(username, now);

    await publishNotification({
      title: 'player spotted',
      message: `${username} is close to ${bot.username}`,
    });
  });
};
