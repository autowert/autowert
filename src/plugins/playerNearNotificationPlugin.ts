import type { Plugin as BotPlugin } from 'mineflayer';

import { Vec3 } from 'vec3';
import { publishNotification } from '../util/notifications';
import { logger } from '../util/logger';

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 30 * 60 * 1000; // 30 minutes
const recentNotifications = new Map<string, number>();

export const playerNearNotificationPlugin: BotPlugin = (bot) => {
  // TODO: make this a seperate plugin,
  let botBaseLocation: Vec3;
  bot.once('death', () => {
    bot._client.once('respawn', (packet, meta) => {
      bot._client.once('position', (packet, meta) => {
        logger.debug('Got bot spawn location after death and respawn');
        const { x, y, z } = packet;
        botBaseLocation = new Vec3(x, y, z);
      });
    })
  });

  bot.on('entitySpawn', async (entity) => {
    if (entity.type !== 'player') return;

    if (entity === bot.entity) return;

    if (!botBaseLocation) return logger.debug({ username: entity.username }, 'Another player near, but bot spawn is unknown');
    if (bot.entity.position.xzDistanceTo(botBaseLocation) > 1_000) return;

    const username = entity.username;
    if (!username) return logger.warn({ entity }, 'Player near bot spawn does not have an associated username');

    const now = Date.now();
    if (recentNotifications.has(username)) {
      const last = recentNotifications.get(username)!;
      const diff = now - last;

      if (diff < MIN_DELAY_BETWEEN_NOTIFICATIONS) return;
    }
    recentNotifications.set(username, now);

    await publishNotification({
      title: 'Player spotted',
      message: `${username} is close to ${bot.username}`,
    });
  });
};
