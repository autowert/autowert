import { type BaseCommand } from './BaseCommand';

import { kitCommand } from './kitCommand';
import { kitlistCommand } from './kitlistCommand';
import { orderCommand } from './orderCommand';
import { blacklistCommand } from './blacklistCommand';
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

  blacklistCommand,

  opKitCommand,
  voidtpCommand,

  portalCommand,
  echestCommand,
  lyricsCommand,

  topCommand,
  nextncCommand,
];
