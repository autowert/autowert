import type { Plugin as BotPlugin } from 'mineflayer';
import type { Vec3 } from 'vec3';

import { publishNotification } from '../util/notifications';

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 30 * 60 * 1000; // 30 minutes
const recentNotifications = new Map<string, number>();

export const playerNearNotificationPlugin: BotPlugin = (bot) => {
  // TODO: make this a seperate plugin,
  //       should also work if the bot didnt't die already
  let botBaseLocation: Vec3;
  bot.once('mainServer', () => {
    bot.once('spawn', () => {
      console.log('got bot spawn location');
      botBaseLocation = bot.entity.position;
    });
  });

  bot.on('entitySpawn', async (entity) => {
    if (entity.type !== 'player') return;

    if (entity === bot.entity) return;

    if (!botBaseLocation) return console.warn('player near, but bot spawn location is unknown');
    if (bot.entity.position.distanceTo(botBaseLocation) > 100) return;

    const username = entity.username;
    if(!username) return console.warn('player entity does not have a username');

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
