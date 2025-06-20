import { type BaseCommand } from './BaseCommand';

import { kitCommand } from './kitCommand';
import { kitlistCommand } from './kitlistCommand';
import { orderCommand } from './orderCommand';
import { elytraCommand } from './elytraCommand';
import { blacklistCommand } from './blacklistCommand';
import { uptimeCommand } from './uptimeCommand';
import { opKitCommand } from './opkitCommand';
import { voidtpCommand } from './voidtpCommand';
import { portalCommand } from './portalCommand';
import { echestCommand } from './echestCommand';
import { lyricsCommand } from './lyricsCommand';
import { topCommand } from './topCommand';
import { nextncCommand } from './nextncCommand';

export const commands: BaseCommand[] = [
  kitCommand,
  kitlistCommand,
  orderCommand,
  elytraCommand,

  blacklistCommand,
  uptimeCommand,

  opKitCommand,
  voidtpCommand,

  portalCommand,
  echestCommand,
  lyricsCommand,

  topCommand,
  nextncCommand,
];
